/**
 * Ad integration: AdMob PRIMARY, Chartboost FALLBACK
 */
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
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
let lastInterstitialTime = 0;
let interstitialReady = false;

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

  try {
    await AdMob.initialize({ initializeForTesting: false });
    console.log('[AdMob] SDK initialized');
  } catch (err) {
    console.warn('[AdMob] Init failed:', err);
  }

  try {
    await Chartboost.initialize(CHARTBOOST_CONFIG);
    console.log('[Chartboost] SDK initialized');
  } catch (e) {
    console.warn('[Chartboost] Init error:', e);
  }
  chartboostReady = true;

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

  try {
    console.log('[AdMob] Attempting Rewarded...');
    const amResult = await tryAdMobRewarded(onShow);
    if (amResult.ok) return amResult;
  } catch (e) {
    console.warn('[AdMob] Rewarded failed:', e);
  }

  try {
    if (chartboostReady) {
      console.log('[Chartboost] Attempting Rewarded...');
      return await tryChartboostRewarded(location, onShow);
    }
  } catch (e) {
    console.warn('[Chartboost] Rewarded failed:', e);
  }

  rewardedAdInProgress = false;
  return { ok: false, error: 'No ads available. Try again later.' };
}

async function tryAdMobRewarded(onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise(async (resolve) => {
    let settled = false;
    const listeners: PluginListenerHandle[] = [];
    const finish = (r: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      adActive = false;
      rewardedAdInProgress = false;
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

async function tryChartboostRewarded(location: string, onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
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
        adActive = false;
        rewardedAdInProgress = false;
        resolve({ ok: true, reward: 50 });
      } else if (data.event === 'onAdDismissed') {
        settled = true;
        clearTimeout(timeout);
        adActive = false;
        rewardedAdInProgress = false;
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
          rewardedAdInProgress = false;
          listener.remove();
          reject(e);
        }
      });
    }).catch(reject);
  });
}

// ==================== BANNER ADS ====================

export async function showBannerAd(location: string = "Main_Menu_Banner"): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) return;

  try {
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER' as any,
      position: 'BOTTOM_CENTER' as any,
      isTesting: false,
    });
    console.log('[AdMob] Banner shown');
    return;
  } catch (e) {
    console.warn('[AdMob] Banner failed:', e);
  }

  if (chartboostReady) {
    try {
      await Chartboost.showBanner({ location });
      console.log('[Chartboost] Banner shown');
      return;
    } catch (e) {
      console.warn('[Chartboost] Banner failed:', e);
    }
  }

  if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
  bannerRetryTimer = setTimeout(() => showBannerAd(location), 20000);
}

// ==================== INTERSTITIAL ADS ====================

export async function preloadInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved() || interstitialReady) return;
  try {
    await AdMob.prepareInterstitial({
      adId: AD_UNIT_IDS.INTERSTITIAL,
      isTesting: false,
    });
    interstitialReady = true;
    console.log('[AdMob] Interstitial preloaded');
  } catch (e) {
    interstitialReady = false;
    console.warn('[AdMob] Preload failed', e);
  }
}

export async function showInterstitialAd(
  location: string = "Between_Levels",
  onShow?: () => void,
  onDismiss?: () => void
): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) {
    onDismiss?.();
    return;
  }

  if (Date.now() - lastInterstitialTime < 45000) {
    onDismiss?.();
    return;
  }

  // 1. ADMOB FIRST
  try {
    if (!interstitialReady) {
      await Promise.race([
        AdMob.prepareInterstitial({
          adId: AD_UNIT_IDS.INTERSTITIAL,
          isTesting: false,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AdMob prepare timeout')), 1800)
        ),
      ]);
      interstitialReady = true;
    }
    onShow?.();
    adActive = true;
    await AdMob.showInterstitial();
    adActive = false;
    interstitialReady = false;
    lastInterstitialTime = Date.now();
    onDismiss?.();
    setTimeout(() => preloadInterstitial(), 1000);
    return;
  } catch (e) {
    console.warn('[Mediation] AdMob failed → Chartboost', e);
    adActive = false;
    interstitialReady = false;
  }

  // 2. CHARTBOOST FALLBACK
  if (chartboostReady) {
    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const timeout = setTimeout(() => {
          if (!settled) { settled = true; reject(new Error('Chartboost timeout')); }
        }, 3000);
        Chartboost.addListener('interstitialEvent', (data) => {
          if (settled) return;
          if (data.event === 'onAdDismissed') {
            settled = true;
            clearTimeout(timeout);
            resolve();
          } else if (data.event === 'onAdDisplayFailed') {
            settled = true;
            clearTimeout(timeout);
            reject(new Error('Chartboost display failed'));
          }
        }).then((listener) => {
          onShow?.();
          adActive = true;
          Chartboost.showInterstitial({ location }).catch((err) => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              listener.remove();
              reject(err);
            }
          });
        }).catch(reject);
      });
      adActive = false;
      lastInterstitialTime = Date.now();
      onDismiss?.();
      return;
    } catch (e) {
      console.warn('[Mediation] Chartboost failed', e);
      adActive = false;
    }
  }

  // 3. BOTH FAILED
  adActive = false;
  onDismiss?.();
}
