// Contenu de supabase/functions/notify-intervenants/index.ts
// eslint-disable-next-line import/no-unresolved
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// eslint-disable-next-line import/no-unresolved
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { record } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: tokens, error: dbError } = await supabase
      .from('intervenant_tokens')
      .select('expo_push_token')

    if (dbError) throw dbError

    const pushTokens = tokens?.map(t => t.expo_push_token) || []

    if (pushTokens.length > 0) {
      const message = {
        to: pushTokens,
        sound: 'default',
        title: '🚨 Nouveau Signalement GDC',
        body: `Type: ${record.type_harcelement} | Urgence: ${record.urgence}`,
        data: { reportId: record.id },
      }

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })
    }

    return new Response(JSON.stringify({ message: "Notification envoyée" }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})