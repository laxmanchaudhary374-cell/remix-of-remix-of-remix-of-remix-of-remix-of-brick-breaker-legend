/**
 * Google Play Billing (and iOS) via @capgo/native-purchases
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
let PURCHASE_TYPE: any = null;

async function getBillingPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!NativePurchases) {
    const mod = await import('@capgo/native-purchases');
    NativePurchases = mod.NativePurchases;
    PURCHASE_TYPE = mod.PURCHASE_TYPE;
  }
  return NativePurchases;
}

export async function initBilling(): Promise<boolean> {
  const billing = await getBillingPlugin();
  if (!billing) return false;
  try {
    // Some versions don't require initialize(); call defensively
    if (typeof billing.initialize === 'function') {
      await billing.initialize();
    }
    console.log('[Billing] Initialized');
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
      alert('Unknown product. Please try again.');
      return 0;
    }

    const billing = await getBillingPlugin();
    if (!billing) {
      alert('In-app purchases only work in the installed app from Google Play.');
      return 0;
    }

    console.log('[Billing] Starting purchase for', productId);

    try {
      const result = await billing.purchaseProduct({
        productIdentifier: productId,
        productType: PURCHASE_TYPE?.INAPP ?? 'inapp',
        quantity: 1,
        isConsumable: true,
        autoAcknowledgePurchases: true,
      });

      console.log('[Billing] Purchase result:', result);

      if (result && (result.transactionId || result.purchaseToken)) {
        return PRODUCT_TO_COINS[productId] || 0;
      }
      alert('Purchase did not complete. No coins added.');
      return 0;
    } catch (purchaseErr: any) {
      const msg = purchaseErr?.message || purchaseErr?.errorMessage || JSON.stringify(purchaseErr);
      console.error('[Billing] purchaseProduct failed:', purchaseErr);
      // User-cancelled is common — don't alarm
      if (/cancel/i.test(msg)) {
        console.log('[Billing] User cancelled');
        return 0;
      }
      alert(`Purchase failed: ${msg}`);
      return 0;
    }
  } catch (err: any) {
    console.error('[Billing] Purchase error:', err);
    alert(`Purchase error: ${err?.message || err}`);
    return 0;
  } finally {
    pendingPurchases.delete(packageId);
  }
}
