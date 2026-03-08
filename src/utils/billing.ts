/**
 * Google Play Billing integration via @capawesome/capacitor-google-play-billing
 *
 * TODO: Replace these placeholder product IDs with your actual
 * Google Play Console in-app product IDs before publishing.
 */
import { Capacitor } from '@capacitor/core';

// ============================
// PRODUCT ID CONFIGURATION
// Replace these with your Google Play Console product IDs
// ============================
export const BILLING_PRODUCT_IDS = {
  COIN_STARTER: 'coin_starter_100',   // 100 coins - $0.99
  COIN_PRO: 'coin_pro_500',           // 500 coins - $3.99
  COIN_WHALE: 'coin_whale_1500',      // 1500 coins - $9.99
} as const;

// Map shop package IDs to billing product IDs
const PACKAGE_TO_PRODUCT: Record<string, string> = {
  coin_starter: BILLING_PRODUCT_IDS.COIN_STARTER,
  coin_pro: BILLING_PRODUCT_IDS.COIN_PRO,
  coin_whale: BILLING_PRODUCT_IDS.COIN_WHALE,
};

// Map product IDs to coin amounts for fulfillment
const PRODUCT_TO_COINS: Record<string, number> = {
  [BILLING_PRODUCT_IDS.COIN_STARTER]: 100,
  [BILLING_PRODUCT_IDS.COIN_PRO]: 500,
  [BILLING_PRODUCT_IDS.COIN_WHALE]: 1500,
};

let GooglePlayBilling: any = null;

async function getBillingPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!GooglePlayBilling) {
    const mod = await import('@capawesome/capacitor-google-play-billing');
    GooglePlayBilling = mod.GooglePlayBilling;
  }
  return GooglePlayBilling;
}

/**
 * Initialize the billing client connection.
 * Call once at app startup.
 */
export async function initBilling(): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing) return false;

  try {
    const { isReady } = await billing.isReady();
    if (!isReady) {
      await billing.startConnection();
    }
    return true;
  } catch (err) {
    console.error('[Billing] Failed to init:', err);
    return false;
  }
}

/**
 * Purchase a coin package.
 * @param packageId - The shop package id (e.g. 'coin_starter')
 * @returns The number of coins to award, or 0 if purchase failed/cancelled
 */
export async function purchaseCoinPackage(packageId: string): Promise<number> {
  const productId = PACKAGE_TO_PRODUCT[packageId];
  if (!productId) {
    console.error('[Billing] Unknown package:', packageId);
    return 0;
  }

  const billing = await getBillingPlugin();

  // Fallback for web preview: simulate purchase
  if (!billing) {
    console.log('[Billing] Web preview — simulating purchase for', packageId);
    return PRODUCT_TO_COINS[productId] || 0;
  }

  try {
    // Query product details
    const { products } = await billing.getProducts({
      productIds: [productId],
      productType: 'inapp',
    });

    if (!products || products.length === 0) {
      console.error('[Billing] Product not found:', productId);
      return 0;
    }

    // Launch the purchase flow
    await billing.launchBillingFlow({
      productId,
      productType: 'inapp',
    });

    // Listen for purchase updates
    return new Promise<number>((resolve) => {
      const timeout = setTimeout(() => resolve(0), 120_000); // 2 min timeout

      billing.addListener('purchasesUpdated', async (event: any) => {
        clearTimeout(timeout);
        const purchase = event.purchases?.[0];
        if (purchase && purchase.purchaseState === 1) {
          // Acknowledge/consume the purchase
          await billing.consumePurchase({ purchaseToken: purchase.purchaseToken });
          resolve(PRODUCT_TO_COINS[productId] || 0);
        } else {
          resolve(0);
        }
      });
    });
  } catch (err) {
    console.error('[Billing] Purchase error:', err);
    return 0;
  }
}
