/**
 * Google Play Billing integration via @capgo/native-purchases v8.4+
 * 
 * FIX: Using static import instead of dynamic import() because
 * dynamic import causes "NativePurchases.then() is not implemented on android" error.
 */
import { Capacitor } from '@capacitor/core';
import { NativePurchases } from '@capgo/native-purchases';

const PACKAGE_TO_PRODUCT: Record<string, string> = {
  starter_pack: 'starter_pack',
  pro_pack: 'pro_pack',
  whale_pack: 'whale_pack',
  coin_starter: 'starter_pack',
  coin_pro: 'pro_pack',
  coin_whale: 'whale_pack',
  remove_ads: 'remove_ads',
  remove_ads_pack: 'remove_ads',
};

const PRODUCT_TO_COINS: Record<string, number> = {
  starter_pack: 500,
  pro_pack: 2500,
  whale_pack: 7500,
};

/**
 * Check if billing is supported.
 */
export async function initBilling(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Billing] Not native platform');
    return false;
  }

  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    console.log('[Billing] isBillingSupported:', isBillingSupported);
    if (!isBillingSupported) {
      return false;
    }

    // Try to load products
    try {
      const { products } = await NativePurchases.getProducts({
        productIdentifiers: ['starter_pack', 'pro_pack', 'whale_pack', 'remove_ads'],
        productType: 'inapp' as any,
      });
      console.log('[Billing] Products found:', products?.length || 0);
    } catch (e) {
      console.warn('[Billing] getProducts failed:', e);
    }

    return true;
  } catch (err) {
    console.error('[Billing] Init failed:', err);
    return true;
  }
}

export async function purchaseCoinPackage(packageId: string): Promise<number> {
  console.log('[Billing] purchaseCoinPackage:', packageId);

  if (!Capacitor.isNativePlatform()) {
    alert('Purchases only work in the installed app.');
    return 0;
  }

  const productId = PACKAGE_TO_PRODUCT[packageId];
  if (!productId) {
    console.error('[Billing] Unknown package:', packageId);
    alert('Unknown product.');
    return 0;
  }
  console.log('[Billing] productId:', productId);

  try {
    console.log('[Billing] Calling purchaseProduct...');
    const isRemoveAds = productId === 'remove_ads' || productId === 'remove_ads_pack';
    const result = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      productType: 'inapp' as any,
      quantity: 1,
      isConsumable: !isRemoveAds,
    });

    console.log('[Billing] Result:', JSON.stringify(result));

    if (result && (result.purchaseToken || result.transactionId)) {
      console.log('[Billing] Purchase SUCCESS');
      
      // If it's the remove ads pack, it's NOT consumable
      const isConsumable = productId !== 'remove_ads' && productId !== 'remove_ads_pack';
      
      try {
        if (result.purchaseToken && isConsumable) {
          await NativePurchases.consumePurchase({ purchaseToken: result.purchaseToken });
          console.log('[Billing] Consumed OK');
        }
      } catch (consumeErr) {
        console.error('[Billing] Consume failed:', consumeErr);
      }
      
      if (productId === 'remove_ads' || productId === 'remove_ads_pack') {
        return -1; // Special value for remove ads
      }
      
      const coins = PRODUCT_TO_COINS[productId] || 0;
      console.log('[Billing] Granting', coins, 'coins');
      return coins;
    }

    console.log('[Billing] No token - cancelled');
    return 0;
  } catch (err: any) {
    const msg = err?.message || err?.errorMessage || String(err);
    console.error('[Billing] ERROR:', msg);

    if (msg.includes('cancel') || msg.includes('Cancel') || msg.includes('USER_CANCELED')) {
      return 0;
    }

    if (msg.includes('already owned') || msg.includes('ITEM_ALREADY_OWNED')) {
      try {
        const { purchases } = await NativePurchases.getPurchases({ productType: 'inapp' as any });
        if (purchases) {
          for (const p of purchases) {
            const pId = (p as any).productId || (p as any).productIdentifier;
            if (pId === productId && (p as any).purchaseToken) {
              await NativePurchases.consumePurchase({ purchaseToken: (p as any).purchaseToken });
              return PRODUCT_TO_COINS[productId] || 0;
            }
          }
        }
      } catch (e) {
        console.error('[Billing] Consume owned failed:', e);
      }
      alert('Item already owned. Restart app and try again.');
      return 0;
    }

    alert('Purchase failed: ' + msg);
    return 0;
  }
}

/**
 * Restore any unconsumed purchases (call on app start)
 */
export async function restoreUnconsumedPurchases(): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;

  try {
    const { purchases } = await NativePurchases.getPurchases({ productType: 'inapp' as any });
    let totalCoins = 0;

    if (purchases && purchases.length > 0) {
      for (const p of purchases) {
        const productId = (p as any).productId || (p as any).productIdentifier;
        const coins = PRODUCT_TO_COINS[productId] || 0;
        if (coins > 0 && (p as any).purchaseToken) {
          try {
            await NativePurchases.consumePurchase({ purchaseToken: (p as any).purchaseToken });
            totalCoins += coins;
            console.log('[Billing] Restored:', productId, coins);
          } catch (e) {
            console.error('[Billing] Restore consume failed:', e);
          }
        }
      }
    }
    return totalCoins;
  } catch (err) {
    console.error('[Billing] Restore failed:', err);
    return 0;
  }
}
