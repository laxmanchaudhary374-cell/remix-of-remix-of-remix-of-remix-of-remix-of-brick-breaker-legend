/**
 * Google Play Billing integration via @capgo/native-purchases
 *
 * TODO: Replace these placeholder product IDs with your actual
 * Google Play Console in-app product IDs before publishing.
 */
import { Capacitor } from '@capacitor/core';

// ============================
// PRODUCT ID CONFIGURATION
// TODO: Replace these with your Google Play Console product IDs
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

let NativePurchases: any = null;

async function getBillingPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!NativePurchases) {
    const mod = await import('@capgo/native-purchases');
    NativePurchases = mod.NativePurchases;
  }
  return NativePurchases;
}

/**
 * Initialize the billing client connection.
 * Call once at app startup.
 */
export async function initBilling(): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing) return false;

  try {
    await billing.initialize();
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
    // TODO: Integrate Google Play Billing API here
    // Launch the native purchase flow for a consumable product
    const result = await billing.purchaseProduct({
      productIdentifier: productId,
      productType: 'CONSUMABLE',
      quantity: 1,
    });

    if (result && result.transactionId) {
      // Purchase successful — award coins
      return PRODUCT_TO_COINS[productId] || 0;
    }
    return 0;
  } catch (err) {
    console.error('[Billing] Purchase error:', err);
    return 0;
  }
}
