import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) throw new Error('Não autorizado')

    // Obter tokens do utilizador
    const { data: settings } = await supabaseClient
      .from('google_drive_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!settings?.access_token) throw new Error('Google Drive não conectado')

    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    // 1. Criar/Obter Pasta Raiz "SistemaDocumentos"
    // (Simplificado: Upload direto para o Drive por agora)
    
    const metadata = {
      name: file.name,
      mimeType: file.type,
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${settings.access_token}` },
      body: form
    })

    const result = await response.json()
    if (result.error) throw new Error(result.error.message)

    console.log("[google-drive-upload] Upload concluído:", result.id);

    return new Response(JSON.stringify({
      fileId: result.id,
      webViewLink: result.webViewLink,
      downloadLink: result.webContentLink
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("[google-drive-upload] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})