// Supabase Edge Function: whatsapp-sender
// Deploy to Supabase using: supabase functions deploy whatsapp-sender

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")
const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")

serve(async (req) => {
  const { to, message, campaign_id, user_id } = await req.json()

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const result = await response.json()

    // Log the result back to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    await supabase.from("message_logs").insert({
      user_id,
      campaign_id,
      whatsapp_number: to,
      message_content: message,
      status: response.ok ? "sent" : "failed",
      whatsapp_message_id: result.messages?.[0]?.id,
      error_message: response.ok ? null : JSON.stringify(result),
    })

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
