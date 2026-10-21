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

const PRICE_IDS: Record<string, Record<string, string>> = {
  MX: {
    monthly: Deno.env.get("STRIPE_PRICE_MX_MONTHLY") ?? "price_mx_monthly",
    quarterly: Deno.env.get("STRIPE_PRICE_MX_QUARTERLY") ?? "price_mx_quarterly",
  },
  US: {
    monthly: Deno.env.get("STRIPE_PRICE_US_MONTHLY") ?? "price_us_monthly",
    quarterly: Deno.env.get("STRIPE_PRICE_US_QUARTERLY") ?? "price_us_quarterly",
  },
  ES: {
    monthly: Deno.env.get("STRIPE_PRICE_ES_MONTHLY") ?? "price_es_monthly",
    quarterly: Deno.env.get("STRIPE_PRICE_ES_QUARTERLY") ?? "price_es_quarterly",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401 });

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const { plan, country } = await req.json();
    if (!plan || !country) {
      return new Response(JSON.stringify({ error: "plan y country requeridos" }), { status: 400 });
    }

    const priceId = PRICE_IDS[country]?.[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Precio no configurado" }), { status: 400 });
    }

    let customerId: string;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { supabase_user_id: user.id, plan, country },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as any;

    return new Response(
      JSON.stringify({ subscriptionId: subscription.id, clientSecret: paymentIntent.client_secret }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
