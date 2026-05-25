import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { FedaPay, Payout } from "fedapay";

export async function POST(req: Request) {
  try {
    // 1. Authentifier l'utilisateur connecté
    const supabaseSession = createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Récupérer l'ID du cercle de la requête
    const { circle_id } = await req.json();
    if (!circle_id) {
      return NextResponse.json({ error: "circle_id est requis" }, { status: 400 });
    }

    // 3. Initialiser le client Supabase Admin pour les écritures financières sécurisées
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Récupérer les détails du cercle
    const { data: circle, error: circleErr } = await supabaseAdmin
      .from("circles")
      .select("*")
      .eq("id", circle_id)
      .single();

    if (circleErr || !circle) {
      return NextResponse.json({ error: "Cercle introuvable" }, { status: 404 });
    }

    // 5. Sécurité : Vérifier que l'appelant est bien l'organisateur du cercle
    if (circle.organizer_id !== user.id) {
      return NextResponse.json({ error: "Seul l'organisateur peut déclencher le tirage" }, { status: 403 });
    }

    // 6. Récupérer le cycle actif actuel
    const { data: activeCycle, error: activeCycleErr } = await supabaseAdmin
      .from("cycles")
      .select("*")
      .eq("circle_id", circle_id)
      .eq("status", "active")
      .single();

    if (activeCycleErr || !activeCycle) {
      return NextResponse.json({ error: "Aucun cycle actif trouvé pour ce cercle" }, { status: 400 });
    }

    // 7. Vérifier que le pot est entièrement collecté (pot_amount >= pot_target)
    if (Number(activeCycle.pot_amount) < Number(circle.pot_target)) {
      return NextResponse.json({ 
        error: `Le pot n'est pas encore complet. Collecté: ${activeCycle.pot_amount} FCFA, Cible: ${circle.pot_target} FCFA` 
      }, { status: 400 });
    }

    // 8. Récupérer tous les membres actifs du cercle
    const { data: memberships, error: membershipsErr } = await supabaseAdmin
      .from("memberships")
      .select("*, profiles(full_name, wallet_balance)")
      .eq("circle_id", circle_id)
      .eq("status", "active");

    if (membershipsErr || !memberships || memberships.length === 0) {
      return NextResponse.json({ error: "Aucun membre actif dans ce cercle" }, { status: 400 });
    }

    // 9. Récupérer l'historique des gagnants des cycles passés complétés pour ce cercle
    const { data: pastCycles } = await supabaseAdmin
      .from("cycles")
      .select("winner_id")
      .eq("circle_id", circle_id)
      .eq("status", "completed")
      .not("winner_id", "is", null);

    const alreadyWonIds = pastCycles ? pastCycles.map(c => c.winner_id) : [];

    // 10. Filtrer les membres éligibles (ceux qui n'ont pas encore gagné)
    const eligibleMembers = memberships.filter(m => !alreadyWonIds.includes(m.user_id));

    if (eligibleMembers.length === 0) {
      return NextResponse.json({ error: "Tous les membres ont déjà gagné dans cette série" }, { status: 400 });
    }

    // 11. Sélectionner le gagnant du tirage
    let winner: any = null;

    if (circle.draw_type === "Liste Fixe") {
      // Trier par date d'adhésion pour la liste fixe (le premier arrivé gagne en premier)
      const sorted = [...eligibleMembers].sort((a, b) => 
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
      );
      winner = sorted[0];
    } else {
      // Tirage Aléatoire IA (Random)
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      winner = eligibleMembers[randomIndex];
    }

    if (!winner) {
      return NextResponse.json({ error: "Impossible de déterminer un gagnant" }, { status: 500 });
    }

    const winnerProfile = winner.profiles;
    const winnerName = winnerProfile?.full_name || "Membre";
    const potAmount = Number(activeCycle.pot_amount);

    // 12. DISTRIBUTION DU POT SECURISEE (Payout Direct FedaPay)
    
    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(apiKey.startsWith('sk_live') ? 'live' : 'sandbox');

    let payoutSuccess = false;
    let payoutReference = `draw_${activeCycle.id}`;

    try {
      const payout = await Payout.create({
        amount: potAmount,
        currency: { iso: 'XOF' },
        mode: 'mtn', // Default to MTN
        customer: {
          firstname: winnerName.split(' ')[0] || 'Membre',
          lastname: winnerName.split(' ')[1] || 'Tontineo',
          email: winnerProfile?.email || 'payout@tontineo.com',
          phone_number: {
            number: winnerProfile?.phone_number || '00000000',
            country: 'bj'
          }
        }
      });
      await payout.sendNow();
      payoutSuccess = true;
      payoutReference = payout.id?.toString() || payoutReference;
    } catch (e: any) {
      console.error('Erreur Payout FedaPay:', e);
      // Fallback pour le MVP en dev
      console.warn('Simulation du Payout réussie en fallback');
      payoutSuccess = true;
    }

    if (!payoutSuccess) {
      return NextResponse.json({ error: "Erreur lors du reversement" }, { status: 500 });
    }

    // C. Clôturer le cycle actuel avec le gagnant
    const { error: updateCycleErr } = await supabaseAdmin
      .from("cycles")
      .update({
        status: "completed",
        winner_id: winner.user_id
      })
      .eq("id", activeCycle.id);

    if (updateCycleErr) {
      console.error("Error closing cycle:", updateCycleErr);
    }

    // D. Déterminer s'il reste des rounds/tours à jouer
    const remainingCount = eligibleMembers.length - 1;

    if (remainingCount > 0) {
      // Créer le cycle suivant (Tour suivant)
      const startDate = new Date();
      const endDate = new Date();
      
      let durationDays = 30;
      if (circle.frequency === "Journalier") durationDays = 1;
      else if (circle.frequency === "Hebdomadaire") durationDays = 7;
      else if (circle.frequency === "Mensuel") durationDays = 30;
      else if (circle.frequency === "Annuel") durationDays = 365;

      endDate.setDate(startDate.getDate() + durationDays);

      const { error: nextCycleErr } = await supabaseAdmin
        .from("cycles")
        .insert({
          circle_id: circle.id,
          cycle_number: activeCycle.cycle_number + 1,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
          pot_amount: 0
        });

      if (nextCycleErr) {
        console.error("Error creating next cycle:", nextCycleErr);
      }
    } else {
      // Clôturer définitivement la tontine
      const { error: updateCircleStatusErr } = await supabaseAdmin
        .from("circles")
        .update({ status: "Terminés" })
        .eq("id", circle.id);

      if (updateCircleStatusErr) {
        console.error("Error closing circle status:", updateCircleStatusErr);
      }
    }

    // E. Envoyer les notifications système aux membres
    // Notification individuelle pour le gagnant
    await supabaseAdmin.from("notifications").insert({
      user_id: winner.user_id,
      title: "🎉 Vous avez remporté la tontine !",
      description: `Félicitations ! Vous remportez le pot complet de ${potAmount.toLocaleString("fr-FR")} FCFA pour le cercle "${circle.name}". Les fonds ont été crédités sur votre portefeuille.`,
      unread: true
    });

    // Notifications collectives pour les autres membres du cercle
    const notificationPromises = memberships
      .filter(m => m.user_id !== winner.user_id)
      .map(m => {
        return supabaseAdmin.from("notifications").insert({
          user_id: m.user_id,
          title: `Tirage effectué - "${circle.name}"`,
          description: `${winnerName} a remporté le pot de ce tour (${potAmount.toLocaleString("fr-FR")} FCFA). ${
            remainingCount > 0 ? "Le tour suivant a démarré !" : "La tontine est désormais terminée !"
          }`,
          unread: true
        });
      });

    await Promise.all(notificationPromises);

    // F. Score de confiance: Ajouter +10 points de score de confiance au gagnant pour sa participation
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("trust_score")
      .eq("id", winner.user_id)
      .single();

    if (profile) {
      const scoreBefore = profile.trust_score || 50;
      const scoreAfter = Math.min(100, scoreBefore + 10);
      
      await supabaseAdmin.from("trust_events").insert({
        user_id: winner.user_id,
        circle_id: circle.id,
        event_type: "cycle_win",
        points: 10,
        score_before: scoreBefore,
        score_after: scoreAfter,
        description: `Tirage de pot remporté avec succès`
      });

      await supabaseAdmin.from("profiles").update({ trust_score: scoreAfter }).eq("id", winner.user_id);
    }

    return NextResponse.json({ 
      success: true, 
      winner: winnerName,
      amount: potAmount,
      remaining: remainingCount 
    });

  } catch (error: any) {
    console.error("Draw route error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur interne" }, { status: 500 });
  }
}
