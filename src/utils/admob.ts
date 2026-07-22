/**
 * AdMob integration via @capacitor-community/admob
 * with Chartboost Direct SDK failover
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
  try {
    await AdMob.hideBanner();
  } catch {}
  try {
    await Chartboost.hideBanner();
  } catch {}
  if (bannerRetryTimer) {
    clearTimeout(bannerRetryTimer);
    bannerRetryTimer = null;
  }
}

export async function initAdMob(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }
  
  // Initialize Chartboost as well
  try {
    await Chartboost.initialize(CHARTBOOST_CONFIG);
  } catch (e) {
    console.error('Chartboost init error', e);
  }

  if (initialized) return true;

  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[AdMob] Init failed:', err);
    return false;
  }
}

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
    // Try AdMob first
    console.log('[AdMob] Attempting AdMob Rewarded...');
    const result = await tryShowAdMobRewarded(onShow);
    if (result.ok && result.reward > 0) return result;
    
    // If AdMob fails or returns no reward, try Chartboost
    console.log('[Chartboost] AdMob failed, attempting Chartboost Rewarded...');
    if (onShow) onShow();
    adActive = true;
    
    return await new Promise<RewardedAdResult>(async (resolve) => {
      const listener = await Chartboost.addListener('rewardedEvent', (data) => {
        if (data.event === 'onRewardDerived') {
          adActive = false;
          listener.remove();
          resolve({ ok: true, reward: 50 });
        } else if (data.event === 'onAdDismissed') {
          adActive = false;
          listener.remove();
          resolve({ ok: true, reward: 0 });
        }
      });

      try {
        await Chartboost.showRewarded({ location });
      } catch (e) {
        adActive = false;
        listener.remove();
        resolve({ ok: false, error: 'No ads available.' });
      }
    });
  } finally {
    adActive = false;
    rewardedAdInProgress = false;
    setTimeout(() => {
      if (Capacitor.isNativePlatform() && !isAdsRemoved()) showBannerAd();
    }, 1000);
  }
}

async function tryShowAdMobRewarded(onShow?: () => void): Promise<RewardedAdResult> {
  return new Promise(async (resolve) => {
    let settled = false;
    const listeners: PluginListenerHandle[] = [];
    
    const finish = (r: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      listeners.forEach(l => l.remove());
      resolve(r);
    };

    try {
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        finish({ ok: true, reward: 50 });
      }));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => finish({ ok: false, error: 'fail' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish({ ok: false, error: 'fail' })));
      listeners.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish({ ok: true, reward: 0 })));

      await AdMob.prepareRewardVideoAd({ adId: AD_UNIT_IDS.REWARDED_COINS, isTesting: false });
      if (onShow) onShow();
      adActive = true;
      await AdMob.showRewardVideoAd();
    } catch (e) {
      finish({ ok: false, error: 'fail' });
    }
  });
}

export async function showBannerAd(location: string = "Main_Menu_Banner"): Promise<void> {
  if (!Capacitor.isNativePlatform() || isAdsRemoved()) return;

  try {
    // Try AdMob first
    await AdMob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER' as any,
      position: 'TOP_CENTER' as any,
      isTesting: false,
    });
  } catch (err) {
    // Fallback to Chartboost
    try {
      await Chartboost.showBanner({ location });
    } catch (e) {
      if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
      bannerRetryTimer = setTimeout(() => showBannerAd(location), 15000);
    }
  }
}

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

  try {
    // Try AdMob
    await AdMob.prepareInterstitial({ adId: AD_UNIT_IDS.INTERSTITIAL, isTesting: false });
    if (onShow) onShow();
    adActive = true;
    await AdMob.showInterstitial();
    adActive = false;
    lastInterstitialTime = now;
    if (onDismiss) onDismiss();
  } catch (e) {
    // Fallback to Chartboost
    try {
      const listener = await Chartboost.addListener('interstitialEvent', (data) => {
        if (data.event === 'onAdDismissed') {
          adActive = false;
          listener.remove();
          if (onDismiss) onDismiss();
        }
      });
      if (onShow) onShow();
      adActive = true;
      await Chartboost.showInterstitial({ location });
      lastInterstitialTime = now;
    } catch (err) {
      adActive = false;
      if (onDismiss) onDismiss();
    }
  }
}
