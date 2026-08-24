/**
 * Ad integration: AdMob PRIMARY, Chartboost FALLBACK.
 * Interstitials are resolved only by native lifecycle events.
 */
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  InterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import Chartboost from './chartboost';

export const AD_UNIT_IDS = {
  REWARDED_COINS: 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: 'ca-app-pub-6637721495380199/9759645640',
  BANNER: 'ca-app-pub-6637721495380199/1558102866',
} as const;

const CHARTBOOST_CONFIG = {
  appId: '6a5a66ed5a384bb0ed68a4af',
  appSignature: 'a9d05c71a75042f74fd4b0da5ce493c4a51233e9',
};

const ADS_REMOVED_KEY = 'neon_breaker_ads_removed';

let initialized = false;
let chartboostReady = false;
let adActive = false;
let rewardedAdInProgress = false;
let interstitialInProgress = false;
let bannerRetryTimer: ReturnType<typeof setTimeout> | null = null;
let lastInterstitialTime = 0;
let interstitialReady = false;
let interstitialPrepareInProgress = false;
let pendingDismissCallback: (() => void) | null = null;
let pendingAdMobOutcome: ((outcome: 'dismissed' | 'failed') => void) | null = null;
let pendingAdMobShowCallback: (() => void) | null = null;

const finishAdMobOutcome = (outcome: 'dismissed' | 'failed'): void => {
  const resolve = pendingAdMobOutcome;
  pendingAdMobOutcome = null;
  pendingAdMobShowCallback = null;
  resolve?.(outcome);
};

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
  void hideBannerAd();
}

export async function hideBannerAd(): Promise<void> {
  try { await Chartboost.hideBanner(); } catch {}
  try { await AdMob.hideBanner(); } catch {}
  if (bannerRetryTimer) {
    clearTimeout(bannerRetryTimer);
    bannerRetryTimer = null;
  }
}

export async function initAdMob(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (initialized) return true;

  let adMobInitialized = false;
  try {
    await AdMob.initialize({ initializeForTesting: false });
    adMobInitialized = true;
    console.log('[AdMob] SDK initialized');

    await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      interstitialReady = true;
      interstitialPrepareInProgress = false;
      console.log('[AdMob] INTERSTITIAL LOADED');
    });

    await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
      interstitialReady = false;
      interstitialPrepareInProgress = false;
      console.warn('[AdMob] INTERSTITIAL FAILED TO LOAD:', error);
    });

    await AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
      adActive = true;
      lastInterstitialTime = Date.now();
      pendingAdMobShowCallback?.();
      pendingAdMobShowCallback = null;
      console.log('[AdMob] INTERSTITIAL SHOWED');
    });

    await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error) => {
      interstitialReady = false;
      adActive = false;
      console.warn('[AdMob] INTERSTITIAL FAILED TO SHOW:', error);
      finishAdMobOutcome('failed');
    });

    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      interstitialReady = false;
      adActive = false;
      console.log('[AdMob] INTERSTITIAL DISMISSED');
      finishAdMobOutcome('dismissed');
      window.setTimeout(() => void preloadInterstitial(), 1500);
    });
  } catch (error) {
    console.warn('[AdMob] Initialization/listener setup failed:', error);
  }

  try {
    await Chartboost.initialize(CHARTBOOST_CONFIG);
    chartboostReady = true;
    console.log('[Chartboost] SDK initialized');
  } catch (error) {
    chartboostReady = false;
    console.warn('[Chartboost] SDK initialization failed:', error);
  }

  initialized = true;
  if (adMobInitialized) void preloadInterstitial();
  return adMobInitialized || chartboostReady;
}

// ==================== REWARDED ADS ====================

export type RewardedAdResult =
  | { ok: true; reward: number }
  | { ok: false; error: string };

export async function showRewardedAd(
  location: string = 'Default',
  onShow?: () => void,
): Promise<RewardedAdResult> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, error: 'Ads only work in the installed app.' };
  }
  if (rewardedAdInProgress || interstitialInProgress) {
    return { ok: false, error: 'Another ad is already opening.' };
  }
  rewardedAdInProgress = true;

  try {
    console.log('[AdMob] Attempting Rewarded...');
    const result = await tryAdMobRewarded(onShow);
    if (result.ok) return result;
  } catch (error) {
    console.warn('[AdMob] Rewarded failed:', error);
  }

  try {
    if (chartboostReady) {
      console.log('[Chartboost] Attempting Rewarded...');
      return await tryChartboostRewarded(location, onShow);
    }
  } catch (error) {
    console.warn('[Chartboost] Rewarded failed:', error);
  }

  rewardedAdInProgress = false;
  return { ok: false, error: 'No ads available. Try again later.' };
}

async function tryAdMobRewarded(onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise(async (resolve) => {
    let settled = false;
    const listeners: PluginListenerHandle[] = [];
    const finish = (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      adActive = false;
      rewardedAdInProgress = false;
      listeners.forEach((listener) => void listener.remove());
      resolve(result);
    };

    try {
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => finish({ ok: true, reward: 50 })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => finish({ ok: false, error: 'AdMob failed to load' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish({ ok: false, error: 'AdMob failed to show' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        if (!settled) finish({ ok: true, reward: 0 });
      }));
      await AdMob.prepareRewardVideoAd({ adId: AD_UNIT_IDS.REWARDED_COINS, isTesting: false });
      onShow?.();
      adActive = true;
      await AdMob.showRewardVideoAd();
    } catch {
      finish({ ok: false, error: 'AdMob not available' });
    }
  });
}

async function tryChartboostRewarded(location: string, onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let listener: { remove: () => void } | null = null;
    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        listener?.remove();
        adActive = false;
        rewardedAdInProgress = false;
        reject(new Error('Chartboost rewarded timeout'));
      }
    }, 8000);

    Chartboost.addListener('rewardedEvent', (data) => {
      if (settled) return;
      if (data.event === 'onRewardEarned') {
        settled = true;
        clearTimeout(timeout);
        listener?.remove();
        adActive = false;
        rewardedAdInProgress = false;
        resolve({ ok: true, reward: 50 });
      } else if (data.event === 'onAdDismissed') {
        settled = true;
        clearTimeout(timeout);
        listener?.remove();
        adActive = false;
        rewardedAdInProgress = false;
        resolve({ ok: true, reward: 0 });
      }
    }).then((handle) => {
      listener = handle;
      onShow?.();
      adActive = true;
      void Chartboost.showRewarded({ location }).catch((error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          listener?.remove();
          adActive = false;
          rewardedAdInProgress = false;
          reject(error);
        }
      });
    }).catch((error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

// ==================== BANNER ADS ====================

export async function showBannerAd(location: string = 'Main_Menu_Banner'): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) return;

  try {
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER' as any,
      position: 'TOP_CENTER' as any,
      isTesting: false,
    });
    console.log('[AdMob] Banner shown');
    return;
  } catch (error) {
    console.warn('[AdMob] Banner failed:', error);
  }

  if (chartboostReady) {
    try {
      await Chartboost.showBanner({ location });
      console.log('[Chartboost] Banner shown');
      return;
    } catch (error) {
      console.warn('[Chartboost] Banner failed:', error);
    }
  }

  if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
  bannerRetryTimer = window.setTimeout(() => void showBannerAd(location), 20000);
}

// ==================== INTERSTITIAL ADS ====================

export async function preloadInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved() || !initialized) return;
  if (interstitialReady || interstitialPrepareInProgress) return;

  interstitialPrepareInProgress = true;
  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_IDS.INTERSTITIAL,
      isTesting: false,
    });
    console.log('[AdMob] Interstitial prepare requested');
  } catch (error) {
    interstitialPrepareInProgress = false;
    interstitialReady = false;
    console.warn('[AdMob] Interstitial preload failed:', error);
  }
}

export async function showInterstitialAd(
  location: string = 'Between_Levels',
  onShow?: () => void,
  onDismiss?: () => void,
): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) {
    onDismiss?.();
    return;
  }

  if (interstitialInProgress || rewardedAdInProgress) {
    console.warn('[Ads] Another ad is already active; continuing without a second ad.');
    onDismiss?.();
    return;
  }

  if (Date.now() - lastInterstitialTime < 45000) {
    console.log('[Ads] Interstitial cooldown active');
    onDismiss?.();
    return;
  }

  interstitialInProgress = true;

  // 1. AdMob first
  if (interstitialReady) {
    try {
      const outcome = await new Promise<'dismissed' | 'failed'>((resolve, reject) => {
        let finished = false;
        const timeout = window.setTimeout(() => {
          if (finished) return;
          finished = true;
          pendingAdMobOutcome = null;
          pendingAdMobShowCallback = null;
          reject(new Error('AdMob interstitial lifecycle timeout'));
        }, 5000);
        pendingAdMobOutcome = (value) => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          resolve(value);
        };
        pendingAdMobShowCallback = onShow ?? null;
        console.log('[AdMob] SHOWING INTERSTITIAL:', location);
        void AdMob.showInterstitial().catch((error) => {
          clearTimeout(timeout);
          pendingAdMobOutcome = null;
          pendingAdMobShowCallback = null;
          reject(error);
        });
      });

      if (outcome === 'dismissed') {
        adActive = false;
        interstitialInProgress = false;
        lastInterstitialTime = Date.now();
        onDismiss?.();
        void preloadInterstitial();
        return;
      }
      console.warn('[AdMob] Interstitial failed to show; trying Chartboost');
      interstitialReady = false;
      adActive = false;
    } catch (error) {
      console.warn('[AdMob] Interstitial lifecycle failed; trying Chartboost:', error);
      pendingAdMobOutcome = null;
      pendingAdMobShowCallback = null;
      interstitialReady = false;
      adActive = false;
    }
  } else {
    console.log('[AdMob] Interstitial not ready; trying Chartboost');
  }

  // 2. Chartboost fallback
  if (chartboostReady) {
    try {
      let listener: { remove: () => void } | null = null;
      let settled = false;
      const chartboostResult = new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            listener?.remove();
            reject(new Error('Chartboost interstitial timeout'));
          }
        }, 4000);

        Chartboost.addListener('interstitialEvent', (data) => {
          if (settled) return;
          if (data.event === 'onAdDismissed') {
            settled = true;
            clearTimeout(timeout);
            listener?.remove();
            resolve();
          } else if (data.event === 'onAdDisplayFailed') {
            settled = true;
            clearTimeout(timeout);
            listener?.remove();
            reject(new Error('Chartboost display failed'));
          }
        }).then((handle) => {
          listener = handle;
          void Chartboost.showInterstitial({ location }).catch((error) => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              listener?.remove();
              reject(error);
            }
          });
        }).catch(reject);
      });

      onShow?.();
      adActive = true;
      await chartboostResult;
      adActive = false;
      interstitialInProgress = false;
      lastInterstitialTime = Date.now();
      onDismiss?.();
      void preloadInterstitial();
      return;
    } catch (error) {
      console.warn('[Chartboost] Interstitial failed:', error);
      adActive = false;
      interstitialInProgress = false;
    }
  }

  // 3. Both failed
  pendingDismissCallback = null;
  pendingAdMobOutcome = null;
  pendingAdMobShowCallback = null;
  adActive = false;
  interstitialInProgress = false;
  console.log('[Ads] No interstitial available; continuing to next level');
  onDismiss?.();
  void preloadInterstitial();
}
