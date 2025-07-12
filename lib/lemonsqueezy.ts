import axios from 'axios';

const LEMONSQUEEZY_API_KEY = process.env.lemonsqueezy_API_KEY;
const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

if (!LEMONSQUEEZY_API_KEY) {
  throw new Error('LemonSqueezy API key is not set in environment variables');
}

export async function createCheckout({ variantId, email, returnUrl }: { variantId: string, email: string, returnUrl: string }) {
  const response = await axios.post(
    `${LEMONSQUEEZY_API_URL}/checkouts`,
    {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          checkout_data: {
            email: email,
            custom: {
              user_email: email,
            },
          },
          product_options: {
            enabled_variants: [variantId],
            redirect_url: returnUrl,
            receipt_button_text: 'Go to Dashboard',
            receipt_link_url: returnUrl,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMONSQUEEZY_STORE_ID?.toString() || '1',
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId.toString(),
            },
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    }
  );
  return response.data;
}

export async function getSubscription(subscriptionId: string) {
  const response = await axios.get(
    `${LEMONSQUEEZY_API_URL}/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        Accept: 'application/json',
      },
    }
  );
  return response.data;
} 