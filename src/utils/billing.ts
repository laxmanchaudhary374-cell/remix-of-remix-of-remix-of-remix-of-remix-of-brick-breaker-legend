/**
 * Google Play Billing integration via @capgo/native-purchases
 */
import { Capacitor } from '@capacitor/core';

export const BILLING_PRODUCT_IDS = {
  COIN_STARTER: 'starter_pack',
  COIN_PRO: 'pro_pack',
  COIN_WHALE: 'whale_pack',
} as const;

const PACKAGE_TO_PRODUCT: Record<string, string> = {
  coin_starter: BILLING_PRODUCT_IDS.COIN_STARTER,
  coin_pro: BILLING_PRODUCT_IDS.COIN_PRO,
  coin_whale: BILLING_PRODUCT_IDS.COIN_WHALE,
};

const PRODUCT_TO_COINS: Record<string, number> = {
  [BILLING_PRODUCT_IDS.COIN_STARTER]: 100,
  [BILLING_PRODUCT_IDS.COIN_PRO]: 500,
  [BILLING_PRODUCT_IDS.COIN_WHALE]: 1500,
};

let NativePurchases: any = null;
let isInitialized = false;
let purchaseCallback: ((coins: number) => void) | null = null;

async function getBillingPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!NativePurchases) {
    try {
      const mod = await import('@capgo/native-purchases');
      NativePurchases = mod.NativePurchases;
    } catch (e) {
      console.error('[Billing] Plugin import error:', e);
    }
  }
  return NativePurchases;
}

export async function initBilling(): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing || isInitialized) return isInitialized;

  try {
    console.log("[Billing] Initializing...");
    await billing.initialize();
    console.log("[Billing] Initialized successfully.");
    
    // Global Purchase Listener
    await billing.addListener("purchaseSuccess", async (data: any) => {
      console.log("[Billing] Purchase Success event received:", data);
      if (data.transactionId) {
        // Acknowledge and Consume the purchase so it can be bought again
        await billing.finishTransaction({ transactionId: data.transactionId });
        
        // Find how many coins to give
        const productId = data.productIdentifier;
        const coins = PRODUCT_TO_COINS[productId] || 0;
        if (purchaseCallback && coins > 0) {
          purchaseCallback(coins);
        }
      }
    });

    isInitialized = true;
    return true;
  } catch (err) {
    console.error('[Billing] Failed to init:', err);
    return false;
  }
}

export function setPurchaseCallback(callback: (coins: number) => void) {
  purchaseCallback = callback;
}

export async function purchaseCoinPackage(packageId: string): Promise<void> {
  const productId = PACKAGE_TO_PRODUCT[packageId];
    if (!productId) {
      console.warn(`[Billing] Product ID not found for package: ${packageId}`);
      return;
    }

  const billing = await getBillingPlugin();
  if (!billing) return;

    if (!isInitialized) {
      console.log("[Billing] Billing not initialized, attempting to initialize...");
      await initBilling();
    }

  try {
    console.log(`[Billing] Attempting to purchase product: ${productId}`);
    await billing.purchaseProduct({
      productIdentifier: productId,
      productType: 'CONSUMABLE',
      quantity: 1,
    });
    // The actual coin reward happens in the 'purchaseSuccess' listener above
  } catch (err: any) {
    console.error('[Billing] Purchase error:', err);
    if (Capacitor.isNativePlatform()) {
      alert('Purchase Error: ' + (err.message || 'Could not connect to Google Play.'));
    }
  }
}
