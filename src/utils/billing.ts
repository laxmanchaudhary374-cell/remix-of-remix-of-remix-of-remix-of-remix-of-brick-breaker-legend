import { Capacitor } from '@capacitor/core';

export const BILLING_PRODUCT_IDS = {
  starter_pack: 'starter_pack',
  pro_pack: 'pro_pack',
  whale_pack: 'whale_pack',
} as const;

let NativePurchases: any = null;

async function getBillingPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!NativePurchases) {
    try {
      const mod = await import('@capgo/native-purchases');
      NativePurchases = mod.NativePurchases;
    } catch (e) {
      console.error('[Billing] Import failed:', e);
      return null;
    }
  }
  return NativePurchases;
}

export async function initBilling(): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing) return false;
  try {
    await billing.initialize();
    console.log('[Billing] Initialized successfully');
    return true;
  } catch (err) {
    console.error('[Billing] Failed to init:', err);
    return false;
  }
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing) return false;

  try {
    console.log('[Billing] Purchasing:', productId);
    const result = await billing.purchaseProduct({
      productIdentifier: productId,
      productType: 'CONSUMABLE',
      quantity: 1,
    });

    console.log('[Billing] Purchase result:', JSON.stringify(result));

    if (result && result.transactionId) {
      await billing.finishTransaction({ transactionId: result.transactionId });
      console.log('[Billing] Transaction finished:', result.transactionId);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Billing] Purchase failed:', err);
    return false;
  }
}
