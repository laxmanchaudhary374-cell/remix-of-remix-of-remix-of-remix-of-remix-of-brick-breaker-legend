/**
 * AdMob integration via @capacitor-community/admob
 * 
 * FIX: Using static import instead of dynamic import() because
 * dynamic import causes "AdMob.then() is not implemented on android" error.
 * 
 * Features:
 * - Banner ad with auto-retry to always show
 * - Interstitial with game pause support
 * - Rewarded ads
 * - Remove ads purchase support
 */
import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';

export const AD_UNIT_IDS = {
  REWARDED_COINS: 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: 'ca-app-pub-6637721495380199/9759645640',
  BANNER: 'ca-app-pub-6637721495380199/1558102866',
} as const;

const ADS_REMOVED_KEY = 'neon_breaker_ads_removed';

let initialized = false;
let adActive = false;
let bannerRetryTimer: any = null;

export function isAdActive(): boolean {
  return adActive;
}

export function isAdsRemoved(): boolean {
  try {
    return localStorage.getItem(ADS_REMOVED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdsRemoved(): void {
  try {
    localStorage.setItem(ADS_REMOVED_KEY, 'true');
  } catch {}
  // Hide banner if currently showing
  hideBannerAd();
}

export async function hideBannerAd(): Promise<void> {
  try {
    await AdMob.hideBanner();
  } catch {}
  if (bannerRetryTimer) {
    clearInterval(bannerRetryTimer);
    bannerRetryTimer = null;
  }
}

export async function initAdMob(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Not native platform');
    return false;
  }
  if (initialized) return true;

  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
    console.log('[AdMob] Initialized OK');
    return true;
  } catch (err) {
    console.error('[AdMob] Init failed:', err);
    return false;
  }
}

export type RewardedAdResult =
  | { ok: true; reward: number }
  | { ok: false; error: string };

export async function showRewardedAd(onShow?: () => void): Promise<RewardedAdResult> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, error: 'Ads only work in the installed app.' };
  }

  if (!initialized) {
    const ok = await initAdMob();
    if (!ok) return { ok: false, error: 'Ad service not available.' };
  }

  return new Promise(async (resolve) => {
    let settled = false;
    const finish = (r: RewardedAdResult) => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(r);
      }
    };

    const listeners: any[] = [];
    const cleanup = () => {
      adActive = false;
      for (const l of listeners) {
        try { l.remove(); } catch (e) { /* ignore */ }
      }
      listeners.length = 0;
    };

    // Timeout after 30s
    const timeout = setTimeout(() => {
      finish({ ok: false, error: 'Ad took too long. Check internet and try again.' });
    }, 30000);

    try {
      let rewardGranted = false;

      // Listen for reward
      const l1 = await AdMob.addListener('onRewardedVideoAdReward' as any, (reward: any) => {
        console.log('[AdMob] Reward:', reward);
        rewardGranted = true;
      });
      listeners.push(l1);

      // Listen for dismiss
      const l2 = await AdMob.addListener('onRewardedVideoAdDismissed' as any, () => {
        console.log('[AdMob] Dismissed, reward:', rewardGranted);
        clearTimeout(timeout);
        finish({ ok: true, reward: rewardGranted ? 50 : 0 });
      });
      listeners.push(l2);

      // Listen for failed to load
      const l3 = await AdMob.addListener('onRewardedVideoAdFailedToLoad' as any, (error: any) => {
        console.error('[AdMob] Failed to load:', error);
        clearTimeout(timeout);
        finish({ ok: false, error: 'No ads available. Try again later.' });
      });
      listeners.push(l3);

      // Listen for failed to show
      const l4 = await AdMob.addListener('onRewardedVideoAdFailedToShow' as any, (error: any) => {
        console.error('[AdMob] Failed to show:', error);
        clearTimeout(timeout);
        finish({ ok: false, error: 'Ad could not be displayed.' });
      });
      listeners.push(l4);

      // Prepare and show
      console.log('[AdMob] Preparing rewarded ad...');
      await AdMob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED_COINS,
        isTesting: false,
      });

      console.log('[AdMob] Showing rewarded ad...');
      adActive = true;
      if (onShow) onShow();
      await AdMob.showRewardVideoAd();

    } catch (err: any) {
      clearTimeout(timeout);
      const msg = err?.message || String(err);
      console.error('[AdMob] Error:', msg);
      finish({ ok: false, error: 'Ad failed to load. Try again later.' });
    }
  });
}

export async function showBannerAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (isAdsRemoved()) return;

  try {
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER' as any,
      position: 'TOP_CENTER' as any,
      isTesting: false,
    });
    console.log('[AdMob] Banner shown');
    
    // Listen for events to ensure it stays visible
    AdMob.addListener('onBannerAdLoaded' as any, () => {
      console.log('[AdMob] Banner loaded');
    });

    // Auto-retry banner every 30 seconds to ensure it stays visible
    if (bannerRetryTimer) clearInterval(bannerRetryTimer);
    bannerRetryTimer = setInterval(async () => {
      if (isAdsRemoved()) {
        hideBannerAd();
        return;
      }
      try {
        await AdMob.showBanner({
          adId: AD_UNIT_IDS.BANNER,
          adSize: 'BANNER' as any,
          position: 'TOP_CENTER' as any,
          isTesting: false,
        });
      } catch (e) {
        console.log('[AdMob] Banner retry failed, will try again');
      }
    }, 30000);
  } catch (err) {
    console.error('[AdMob] Banner error:', err);
    // Retry after 10 seconds if initial show fails
    setTimeout(() => showBannerAd(), 10000);
  }
}

let lastInterstitialTime = 0;
let interstitialReady = false;

// Pre-load interstitial ad so it shows instantly when needed
export async function preloadInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (isAdsRemoved()) return;
  if (interstitialReady) return;
  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_IDS.INTERSTITIAL,
      isTesting: false,
    });
    interstitialReady = true;
    console.log('[AdMob] Interstitial preloaded');
  } catch (err) {
    console.log('[AdMob] Preload failed, will load on demand');
  }
}

export async function showInterstitialAd(onShow?: () => void, onDismiss?: () => void): Promise<void> {
  if (!Capacitor.isNativePlatform()) { if (onDismiss) onDismiss(); return; }
  if (isAdsRemoved()) { if (onDismiss) onDismiss(); return; }

  const now = Date.now();
  if (now - lastInterstitialTime < 60000) { if (onDismiss) onDismiss(); return; }

  try {
    const listeners: any[] = [];
    const cleanup = () => {
      listeners.forEach(l => { try { l.remove(); } catch (e) {} });
      listeners.length = 0;
    };

    const l1 = await AdMob.addListener('onInterstitialAdShowed' as any, () => {
      console.log('[AdMob] Interstitial showed');
      adActive = true;
      if (onShow) onShow();
    });
    listeners.push(l1);

    const l2 = await AdMob.addListener('onInterstitialAdDismissed' as any, () => {
      console.log('[AdMob] Interstitial dismissed');
      adActive = false;
      cleanup();
      interstitialReady = false;
      // Pre-load next ad for future use
      preloadInterstitial();
      if (onDismiss) onDismiss();
    });
    listeners.push(l2);

    const l3 = await AdMob.addListener('onInterstitialAdFailedToShow' as any, (err) => {
      console.error('[AdMob] Interstitial failed to show:', err);
      cleanup();
      interstitialReady = false;
      if (onDismiss) onDismiss();
    });
    listeners.push(l3);

    // If not preloaded, load now
    if (!interstitialReady) {
      await AdMob.prepareInterstitial({
        adId: AD_UNIT_IDS.INTERSTITIAL,
        isTesting: false,
      });
    }
    interstitialReady = false;
    await AdMob.showInterstitial();
    lastInterstitialTime = now;
  } catch (err) {
    console.error('[AdMob] Interstitial error:', err);
    if (onDismiss) onDismiss();
  }
}
