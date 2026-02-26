import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const userId = url.searchParams.get('state') // Passamos o userId no state

  if (!code || !userId) return new Response('Código ou Estado ausente', { status: 400 })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Trocar código por tokens
    const response = await fetch('https://oauth2.googleapis.com/token', {
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

    const tokens = await response.json()

    if (tokens.error) throw new Error(tokens.error_description)

    // Guardar na base de dados
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

    console.log("[google-drive-callback] Tokens guardados para o utilizador:", userId);

    // Redirecionar de volta para a app
    return new Response(null, {
      status: 302,
      headers: { Location: `${Deno.env.get('APP_URL') || 'http://localhost:8080'}/documentos` }
    })
  } catch (error) {
    console.error("[google-drive-callback] Erro fatal:", error.message);
    return new Response(`Erro na autenticação: ${error.message}`, { status: 500 })
  }
})