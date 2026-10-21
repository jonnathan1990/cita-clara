import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const data = event.data.object as any;

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = data as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        const plan = sub.metadata?.plan ?? "monthly";
        const country = sub.metadata?.country ?? "MX";
        const amount = sub.items.data[0]?.price?.unit_amount ?? 0;
        const currency = (sub.items.data[0]?.price?.currency ?? "mxn").toUpperCase();

        const statusMap: Record<string, string> = {
          active: "active",
          canceled: "canceled",
          incomplete: "active",
          past_due: "active",
          unpaid: "expired",
          incomplete_expired: "expired",
        };

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan,
            country,
            amount_cents: amount,
            currency,
            status: statusMap[sub.status] ?? "active",
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer as string,
            started_at: new Date(sub.start_date * 1000).toISOString(),
            expires_at: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            canceled_at: sub.canceled_at
              ? new Date(sub.canceled_at * 1000).toISOString()
              : null,
          },
          { onConflict: "user_id" }
        );

        await supabase.from("subscription_events").insert({
          user_id: userId,
          event: event.type,
          amount_cents: amount,
          meta: { stripe_subscription_id: sub.id },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = data as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("status", "active");

        await supabase.from("subscription_events").insert({
          user_id: userId,
          event: "canceled",
          meta: { stripe_subscription_id: sub.id },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        break;
      }

      case "charge.refunded": {
        break;
      }
    }
  } catch (err) {
    console.error("Error processing webhook", err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
