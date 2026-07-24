/**
 * Ad integration: Chartboost PRIMARY, AdMob FALLBACK
 * Chartboost is tried first for all ad types.
 * If Chartboost fails, AdMob is tried as backup.
 * When AdMob gets unsuspended, it will automatically work as fallback.
 */
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  type AdLoadInfo,
  type AdMobError,
  type AdMobRewardItem,
} from '@capacitor-community/admob';
import Chartboost from './chartboost';

export const AD_UNIT_IDS = {
  REWARDED_COINS: 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: 'ca-app-pub-6637721495380199/9759645640',
  BANNER: 'ca-app-pub-6637721495380199/1558102866',
} as const;

const CHARTBOOST_CONFIG = {
  appId: "6a5a66ed5a384bb0ed68a4af",
  appSignature: "a9d05c71a75042f74fd4b0da5ce493c4a51233e9"
};

const ADS_REMOVED_KEY = 'neon_breaker_ads_removed';

let initialized = false;
let chartboostReady = false;
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
  hideBannerAd();
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

  // Initialize Chartboost FIRST (primary ad network)
  try {
    await Chartboost.initialize(CHARTBOOST_CONFIG);
    chartboostReady = true;
    console.log('[Chartboost] SDK initialized successfully');
  } catch (e) {
    console.error('[Chartboost] Init failed:', e);
    chartboostReady = false;
  }

  // Initialize AdMob as backup (will fail silently if suspended)
  try {
    await AdMob.initialize({ initializeForTesting: false });
    console.log('[AdMob] SDK initialized');
  } catch (err) {
    console.warn('[AdMob] Init failed (likely suspended):', err);
  }

  initialized = true;
  return true;
}

// ==================== REWARDED ADS ====================

export type RewardedAdResult =
  | { ok: true; reward: number }
  | { ok: false; error: string };

export async function showRewardedAd(location: string = "Default", onShow?: () => void): Promise<RewardedAdResult> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, error: 'Ads only work in the installed app.' };
  }

  if (rewardedAdInProgress) {
    return { ok: false, error: 'Ad is already opening.' };
  }

  rewardedAdInProgress = true;
  await hideBannerAd();

  try {
    // 1. TRY CHARTBOOST FIRST (primary)
    if (chartboostReady) {
      console.log('[Chartboost] Attempting Rewarded at location:', location);
      const cbResult = await tryChartboostRewarded(location, onShow);
      if (cbResult.ok) return cbResult;
    }
  } catch (e) {
    console.warn('[Chartboost] Rewarded failed:', e);
  }

  // 2. FALLBACK TO ADMOB
  try {
    console.log('[AdMob] Attempting Rewarded as fallback...');
    const amResult = await tryAdMobRewarded(onShow);
    return amResult;
  } catch (e) {
    console.warn('[AdMob] Rewarded also failed:', e);
    return { ok: false, error: 'No ads available. Try again later.' };
  } finally {
    rewardedAdInProgress = false;
    setTimeout(() => {
      if (Capacitor.isNativePlatform() && !isAdsRemoved()) showBannerAd();
    }, 1000);
  }
}

async function tryChartboostRewarded(location: string, onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        adActive = false;
        reject(new Error('Chartboost rewarded timeout'));
      }
    }, 10000); // 10 second timeout

    Chartboost.addListener('rewardedEvent', (data) => {
      if (settled) return;
      if (data.event === 'onRewardDerived') {
        settled = true;
        clearTimeout(timeout);
        adActive = false;
        resolve({ ok: true, reward: 50 });
      } else if (data.event === 'onAdDismissed') {
        settled = true;
        clearTimeout(timeout);
        adActive = false;
        resolve({ ok: true, reward: 0 });
      }
    }).then(listener => {
      if (onShow) onShow();
      adActive = true;
      Chartboost.showRewarded({ location }).catch((e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          adActive = false;
          listener.remove();
          reject(e);
        }
      });
    }).catch(reject);
  });
}

async function tryAdMobRewarded(onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise(async (resolve) => {
    let settled = false;
    const listeners: PluginListenerHandle[] = [];

    const finish = (r: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      adActive = false;
      listeners.forEach(l => l.remove());
      resolve(r);
    };

    try {
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => finish({ ok: true, reward: 50 })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => finish({ ok: false, error: 'AdMob failed to load' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish({ ok: false, error: 'AdMob failed to show' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        if (!settled) finish({ ok: true, reward: 0 });
      }));

      await AdMob.prepareRewardVideoAd({ adId: AD_UNIT_IDS.REWARDED_COINS, isTesting: false });
      if (onShow) onShow();
      adActive = true;
      await AdMob.showRewardVideoAd();
    } catch (e) {
      finish({ ok: false, error: 'AdMob not available' });
    }
  });
}

// ==================== BANNER ADS ====================

export async function showBannerAd(location: string = "Main_Menu_Banner"): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) return;

  // 1. TRY CHARTBOOST FIRST
  if (chartboostReady) {
    try {
      await Chartboost.showBanner({ location });
      console.log('[Chartboost] Banner shown');
      return;
    } catch (e) {
      console.warn('[Chartboost] Banner failed:', e);
    }
  }

  // 2. FALLBACK TO ADMOB
  try {
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER' as any,
      position: 'BOTTOM_CENTER' as any,
      isTesting: false,
    });
    console.log('[AdMob] Banner shown');
  } catch (e) {
    console.warn('[AdMob] Banner also failed:', e);
    // Retry after 15 seconds
    if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
    bannerRetryTimer = setTimeout(() => showBannerAd(location), 15000);
  }
}

// ==================== INTERSTITIAL ADS ====================

let lastInterstitialTime = 0;

export async function showInterstitialAd(location: string = "Between_Levels", onShow?: () => void, onDismiss?: () => void): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) {
    if (onDismiss) onDismiss();
    return;
  }

  const now = Date.now();
  if (now - lastInterstitialTime < 45000) {
    if (onDismiss) onDismiss();
    return;
  }

  // 1. TRY CHARTBOOST FIRST
  if (chartboostReady) {
    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const timeout = setTimeout(() => {
          if (!settled) { settled = true; adActive = false; reject(new Error('timeout')); }
        }, 10000);

        Chartboost.addListener('interstitialEvent', (data) => {
          if (settled) return;
          if (data.event === 'onAdDismissed') {
            settled = true;
            clearTimeout(timeout);
            adActive = false;
            resolve();
          } else if (data.event === 'onAdDisplayFailed') {
            settled = true;
            clearTimeout(timeout);
            adActive = false;
            reject(new Error('display failed'));
          }
        }).then(listener => {
          if (onShow) onShow();
          adActive = true;
          Chartboost.showInterstitial({ location }).catch((e) => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              adActive = false;
              listener.remove();
              reject(e);
            }
          });
        }).catch(reject);
      });
      lastInterstitialTime = Date.now();
      if (onDismiss) onDismiss();
      return;
    } catch (e) {
      console.warn('[Chartboost] Interstitial failed:', e);
    }
  }

  // 2. FALLBACK TO ADMOB
  try {
    await AdMob.prepareInterstitial({ adId: AD_UNIT_IDS.INTERSTITIAL, isTesting: false });
    if (onShow) onShow();
    adActive = true;
    await AdMob.showInterstitial();
    adActive = false;
    lastInterstitialTime = Date.now();
    if (onDismiss) onDismiss();
  } catch (e) {
    adActive = false;
    console.warn('[AdMob] Interstitial also failed:', e);
    if (onDismiss) onDismiss();
  }
}

// ==================== PRELOAD (no-op for now) ====================

export async function preloadInterstitial(): Promise<void> {
  return Promise.resolve();
}