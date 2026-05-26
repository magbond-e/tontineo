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
    const avatarFile = formData.get('avatar') as File | null;

    if (!avatarFile) {
      return NextResponse.json({ error: 'Le fichier image est requis' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const timestamp = Date.now();
    const ext = avatarFile.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/avatar_${timestamp}.${ext}`;
    
    // Upload the new avatar
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true
      });

    if (uploadError) throw new Error("Erreur d'upload de l'avatar: " + uploadError.message);

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    // Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw new Error("Erreur mise à jour profil: " + updateError.message);

    return NextResponse.json({ success: true, avatar_url: publicUrl });

  } catch (error: any) {
    console.error('Erreur Avatar upload route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
