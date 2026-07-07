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
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  type AdLoadInfo,
  type AdMobError,
  type AdMobRewardItem,
} from '@capacitor-community/admob';

export const AD_UNIT_IDS = {
  REWARDED_COINS: 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: 'ca-app-pub-6637721495380199/9759645640',
  BANNER: 'ca-app-pub-6637721495380199/1558102866',
} as const;

const ADS_REMOVED_KEY = 'neon_breaker_ads_removed';

let initialized = false;
let adActive = false;
let rewardedAdInProgress = false;
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

  if (rewardedAdInProgress) {
    return { ok: false, error: 'Ad is already opening.' };
  }

  rewardedAdInProgress = true;

  const listeners: PluginListenerHandle[] = [];
  const removeListeners = () => {
    for (const l of listeners) {
      try { l.remove(); } catch { /* ignore */ }
    }
    listeners.length = 0;
  };

  try {
    if (!initialized) {
      const ok = await initAdMob();
      if (!ok) return { ok: false, error: 'Ad service not available.' };
    }

    // Do not keep a banner under a full-screen rewarded ad on Android.
    await hideBannerAd();

    return await new Promise<RewardedAdResult>(async (resolve) => {
      let settled = false;
      let shown = false;
      let rewardGranted = false;
      let loadTimeout: ReturnType<typeof setTimeout> | null = null;
      const finish = (r: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        if (loadTimeout) clearTimeout(loadTimeout);
        resolve(r);
      };

      try {
        listeners.push(await AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
          console.log('[AdMob] Rewarded loaded:', info.adUnitId);
        }));

        listeners.push(await AdMob.addListener(RewardAdPluginEvents.Showed, () => {
          console.log('[AdMob] Rewarded showed');
          shown = true;
          adActive = true;
          if (loadTimeout) clearTimeout(loadTimeout);
        }));

        listeners.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
          console.log('[AdMob] Reward:', reward);
          rewardGranted = true;
        }));

        listeners.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('[AdMob] Dismissed, reward:', rewardGranted);
          adActive = false;
          finish({ ok: true, reward: rewardGranted ? 50 : 0 });
        }));

        listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
          console.error('[AdMob] Failed to load:', error);
          if (!shown) finish({ ok: false, error: 'No ads available. Try again later.' });
        }));

        listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
          console.error('[AdMob] Failed to show:', error);
          adActive = false;
          finish({ ok: false, error: 'Ad could not be displayed.' });
        }));

        // Timeout only while loading/opening. Never timeout while the ad is visible,
        // because resolving early can put app popups over the native ad and freeze it.
        loadTimeout = setTimeout(() => {
          if (!shown) finish({ ok: false, error: 'Ad took too long. Check internet and try again.' });
        }, 20000);

        // Prepare fully before showing — retry a few times on transient no-fill.
        console.log('[AdMob] Preparing rewarded ad...');
        let prepared = false;
        let lastErr: any = null;
        for (let attempt = 1; attempt <= 3 && !prepared; attempt++) {
          try {
            await AdMob.prepareRewardVideoAd({
              adId: AD_UNIT_IDS.REWARDED_COINS,
              isTesting: false,
              immersiveMode: true,
            });
            prepared = true;
          } catch (e) {
            lastErr = e;
            console.log(`[AdMob] Rewarded prepare attempt ${attempt} failed, retrying...`);
            await new Promise(r => setTimeout(r, 1200));
          }
        }
        if (!prepared) throw lastErr || new Error('prepare failed');
        if (settled) return;

        console.log('[AdMob] Showing rewarded ad...');
        adActive = true;
        if (onShow) onShow();
        const reward = await AdMob.showRewardVideoAd();
        if (reward?.amount) rewardGranted = true;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error('[AdMob] Error:', msg);
        finish({ ok: false, error: 'Ad failed to load. Try again later.' });
      }
    });
  } finally {
    // Emergency unlock — always release adActive and listeners even if something crashed.
    adActive = false;
    rewardedAdInProgress = false;
    removeListeners();
    setTimeout(() => {
      if (Capacitor.isNativePlatform() && !isAdsRemoved()) showBannerAd();
    }, 1000);
  }
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
