/**
 * Google Play Billing integration via @capgo/native-purchases
 */
import { Capacitor } from '@capacitor/core';

export const BILLING_PRODUCT_IDS = {
  starter_pack: 'starter_pack',
  pro_pack: 'pro_pack',
  whale_pack: 'whale_pack',
} as const;

const PACKAGE_TO_PRODUCT: Record<string, string> = {
  starter_pack: BILLING_PRODUCT_IDS.starter_pack,
  pro_pack: BILLING_PRODUCT_IDS.pro_pack,
  whale_pack: BILLING_PRODUCT_IDS.whale_pack,
};

const PRODUCT_TO_COINS: Record<string, number> = {
  [BILLING_PRODUCT_IDS.starter_pack]: 100,
  [BILLING_PRODUCT_IDS.pro_pack]: 500,
  [BILLING_PRODUCT_IDS.whale_pack]: 1500,
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

const pendingPurchases = new Set<string>();

export async function purchaseCoinPackage(packageId: string): Promise<number> {
  if (pendingPurchases.has(packageId)) return 0;
  pendingPurchases.add(packageId);

  try {
    const productId = PACKAGE_TO_PRODUCT[packageId];
    if (!productId) {
      console.error('[Billing] Unknown package:', packageId);
      return 0;
    }

    const billing = await getBillingPlugin();

    if (!billing) {
      console.log('[Billing] Not available on this platform');
      return 0;
    }

    try {
      const result = await billing.purchaseProduct({
        productIdentifier: productId,
        productType: 'CONSUMABLE',
        quantity: 1,
      });

      if (result && result.transactionId) {
        try {
          await billing.finishTransaction({
            transactionId: result.transactionId,
          });
        } catch (e) {
          console.error('[Billing] Consume error:', e);
        }
        return PRODUCT_TO_COINS[productId] || 0;
      }
      return 0;
    } catch (purchaseErr: any) {
      const msg = purchaseErr?.message || purchaseErr?.errorMessage || JSON.stringify(purchaseErr);
      console.error('[Billing] purchaseProduct failed:', purchaseErr);
      alert(`Purchase failed: ${msg}`);
      return 0;
    }
  } catch (err) {
    console.error('[Billing] Purchase error:', err);
    return 0;
  } finally {
    pendingPurchases.delete(packageId);
  }
}
