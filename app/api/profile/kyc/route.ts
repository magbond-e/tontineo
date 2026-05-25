import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseSession = createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const docType = formData.get('docType') as string;
    const frontFile = formData.get('frontFile') as File | null;
    const backFile = formData.get('backFile') as File | null;

    if (!docType || !frontFile) {
      return NextResponse.json({ error: 'Le type de document et le fichier recto sont requis' }, { status: 400 });
    }

    if (docType === 'permis' && !backFile) {
      return NextResponse.json({ error: 'Le fichier verso est requis pour le permis' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const timestamp = Date.now();
    let frontUrl = '';
    let backUrl = '';

    // Upload front file
    const frontExt = frontFile.name.split('.').pop();
    const frontPath = `${user.id}/${docType}_front_${timestamp}.${frontExt}`;
    const { data: frontData, error: frontError } = await supabaseAdmin.storage
      .from('kyc')
      .upload(frontPath, frontFile);

    if (frontError) throw new Error("Erreur d'upload du recto: " + frontError.message);
    frontUrl = frontData.path;

    // Upload back file if present
    if (backFile) {
      const backExt = backFile.name.split('.').pop();
      const backPath = `${user.id}/${docType}_back_${timestamp}.${backExt}`;
      const { data: backData, error: backError } = await supabaseAdmin.storage
        .from('kyc')
        .upload(backPath, backFile);

      if (backError) throw new Error("Erreur d'upload du verso: " + backError.message);
      backUrl = backData.path;
    }

    // Pass profile to pending status and store document URLs
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        kyc_status: 'pending',
        kyc_doc_type: docType,
        kyc_front_url: frontUrl,
        kyc_back_url: backUrl || null
      })
      .eq('id', user.id);

    if (updateError) throw new Error("Erreur mise à jour profil: " + updateError.message);

    return NextResponse.json({ success: true, message: 'KYC soumis avec succès' });

  } catch (error: any) {
    console.error('Erreur KYC upload route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
