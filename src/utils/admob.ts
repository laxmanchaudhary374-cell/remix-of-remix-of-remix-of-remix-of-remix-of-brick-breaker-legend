/**
 * AdMob integration via @capacitor-community/admob
 */
import { Capacitor } from '@capacitor/core';

export const AD_UNIT_IDS = {
  REWARDED_COINS: 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: 'ca-app-pub-6637721495380199/9759645640',
  BANNER: 'ca-app-pub-6637721495380199/1558102866',
} as const;

export const ADMOB_APP_ID = 'ca-app-pub-6637721495380199~8632290443';

let AdMob: any = null;
let initialized = false;
let rewardCallback: ((amount: number) => void) | null = null;

async function getAdMobPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!AdMob) {
    try {
      const mod = await import('@capacitor-community/admob');
      AdMob = mod.AdMob;
    } catch (e) {
      console.error('[AdMob] Plugin import error:', e);
    }
  }
  return AdMob;
}

export async function initAdMob(): Promise<boolean> {
  const admob = await getAdMobPlugin();
  if (!admob || initialized) return initialized;

  try {
    await admob.initialize({ initializeForTesting: false });
    
    // Global Reward Listener - This is the "Missing Callback" Copilot mentioned
    await admob.addListener('onRewardedVideoAdReward', (reward: any) => {
      console.log('[AdMob] Reward earned:', reward);
      if (rewardCallback) {
        rewardCallback(50); // Give 50 coins
      }
    });

    initialized = true;
    console.log('[AdMob] Initialized with global listener');
    return true;
  } catch (err) {
    console.error('[AdMob] Failed to init:', err);
    return false;
  }
}

export function setAdRewardCallback(callback: (amount: number) => void) {
  rewardCallback = callback;
}

export async function showRewardedAd(): Promise<boolean> {
  const admob = await getAdMobPlugin();
  if (!admob) return false;

  await initAdMob();

  try {
    await admob.prepareRewardVideoAd({
      adId: AD_UNIT_IDS.REWARDED_COINS,
      isTesting: false,
    });
    await admob.showRewardVideoAd();
    return true;
  } catch (err) {
    console.error('[AdMob] Rewarded ad error:', err);
    return false;
  }
}

export async function showBannerAd(): Promise<void> {
  const admob = await getAdMobPlugin();
  if (!admob) return;
  try {
    await admob.showBanner({
      adId: AD_UNIT_IDS.BANNER,
      adSize: 'BANNER',
      position: 'TOP_CENTER',
      isTesting: false,
    });
  } catch (err) {
    console.error('[AdMob] Banner error:', err);
  }
}

let lastInterstitialTime = 0;
export async function showInterstitialAd(): Promise<void> {
  const admob = await getAdMobPlugin();
  if (!admob) return;
  const now = Date.now();
  if (now - lastInterstitialTime < 60000) return;
  try {
    await admob.prepareInterstitial({ adId: AD_UNIT_IDS.INTERSTITIAL, isTesting: false });
    await admob.showInterstitial();
    lastInterstitialTime = now;
  } catch (err) {
    console.error('[AdMob] Interstitial error:', err);
  }
}
