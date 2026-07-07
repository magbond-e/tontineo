import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Cette route peut être appelée par un service de cron externe (ex: Vercel Cron, GitHub Actions)
export async function GET(req: Request) {
  try {
    // Basic API Key security (if needed)
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Récupérer tous les cycles actifs qui n'ont pas encore été complétés
    const { data: activeCycles, error: cyclesError } = await supabaseAdmin
      .from('cycles')
      .select('id, circle_id, end_date')
      .eq('status', 'active');

    if (cyclesError || !activeCycles) {
      return NextResponse.json({ error: 'Erreur récupération cycles' }, { status: 500 });
    }

    let notificationsSent = 0;

    for (const cycle of activeCycles) {
      // 2. Récupérer les paiements complétés pour ce cycle
      const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('user_id')
        .eq('cycle_id', cycle.id)
        .eq('status', 'completed');

      const paidUserIds = new Set(payments?.map(p => p.user_id) || []);

      // 3. Récupérer les membres du cercle
      const { data: memberships } = await supabaseAdmin
        .from('memberships')
        .select('user_id, profiles(full_name, whatsapp, wa_reminders_enabled)')
        .eq('circle_id', cycle.circle_id)
        .eq('status', 'active');

      if (!memberships) continue;

      const { data: circle } = await supabaseAdmin
        .from('circles')
        .select('name, amount')
        .eq('id', cycle.circle_id)
        .single();

      if (!circle) continue;

      // 4. Identifier les membres en retard ou proches de la date limite
      const endDate = new Date(cycle.end_date);
      const today = new Date();
      const diffHours = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60);

      // Si la date de fin est proche (ex: < 48h) ou passée, et l'utilisateur n'a pas payé
      if (diffHours < 48) {
        for (const member of memberships) {
          if (!paidUserIds.has(member.user_id)) {
            const profile = member.profiles as any;
            if (profile?.whatsapp && profile?.wa_reminders_enabled !== false) {
              
              // SIMULATION DE L'ENVOI WHATSAPP
              console.log(`[SIMULATION WHATSAPP] To: ${profile.whatsapp}`);
              console.log(`[SIMULATION WHATSAPP] Message: Bonjour ${profile.full_name}, n'oubliez pas votre cotisation de ${circle.amount} FCFA pour le cercle "${circle.name}". La date limite approche !`);
              
              notificationsSent++;
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${notificationsSent} notifications de rappel simulées avec succès` 
    });

  } catch (error: any) {
    console.error('Erreur cron reminders:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
