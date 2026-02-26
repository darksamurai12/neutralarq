import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const userId = url.searchParams.get('state')
  const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:8080'

  if (!code || !userId) return new Response('Código ou Estado ausente', { status: 400 })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Trocar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-drive-callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()
    if (tokens.error) throw new Error(tokens.error_description)

    // 2. Validar o email da conta autenticada
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    const googleUser = await userResponse.json()

    const AUTHORIZED_EMAIL = 'neutralarqd@gmail.com'
    
    if (googleUser.email !== AUTHORIZED_EMAIL) {
      console.error(`[google-drive-callback] Tentativa de login não autorizada: ${googleUser.email}`);
      return new Response(null, {
        status: 302,
        headers: { Location: `${APP_URL}/documentos?error=unauthorized_account` }
      })
    }

    // 3. Guardar tokens se for a conta correta
    const { error: dbError } = await supabaseClient
      .from('google_drive_settings')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        is_connected: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (dbError) throw dbError

    console.log("[google-drive-callback] Conta oficial neutralarqd@gmail.com conectada com sucesso.");

    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/documentos?success=connected` }
    })
  } catch (error) {
    console.error("[google-drive-callback] Erro fatal:", error.message);
    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/documentos?error=auth_failed` }
    })
  }
})