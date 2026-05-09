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
    await billing.initialize();
    
    // Add a listener to catch successful purchases even if the app was closed/reopened
    await billing.addListener('purchaseSuccess', async (data: any) => {
      console.log('[Billing] Purchase Success Listener:', data);
      if (data.transactionId) {
        await billing.finishTransaction({ transactionId: data.transactionId });
      }
    });

    isInitialized = true;
    console.log('[Billing] Initialized with listener');
    return true;
  } catch (err) {
    console.error('[Billing] Failed to init:', err);
    return false;
  }
}

export async function purchaseCoinPackage(packageId: string): Promise<number> {
  const productId = PACKAGE_TO_PRODUCT[packageId];
  if (!productId) return 0;

  const billing = await getBillingPlugin();
  if (!billing) {
    console.warn('[Billing] Not on a native device');
    return 0;
  }

  if (!isInitialized) {
    await initBilling();
    await new Promise(r => setTimeout(r, 1500));
  }

  try {
    const result = await billing.purchaseProduct({
      productIdentifier: productId,
      productType: 'CONSUMABLE',
      quantity: 1,
    });

    if (result && result.transactionId) {
      await billing.finishTransaction({ transactionId: result.transactionId });
      return PRODUCT_TO_COINS[productId] || 0;
    }
    return 0;
  } catch (err: any) {
    console.error('[Billing] Purchase error:', err);
    if (Capacitor.isNativePlatform()) {
      alert('Purchase Error: ' + (err.message || 'Could not connect to Google Play.'));
    }
    return 0;
  }
}
