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

async function getAdMobPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!AdMob) {
    const mod = await import('@capacitor-community/admob');
    AdMob = mod.AdMob;
  }
  return AdMob;
}

export async function initAdMob(): Promise<boolean> {
  const admob = await getAdMobPlugin();
  if (!admob || initialized) return initialized;

  try {
    await admob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[AdMob] Failed to init:', err);
    return false;
  }
}

export async function showRewardedAd(): Promise<number> {
  const admob = await getAdMobPlugin();
  if (!admob) return 0;

  return new Promise(async (resolve) => {
    try {
      let rewardGranted = false;

      await admob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED_COINS,
        isTesting: false,
      });

      const rewardListener = await admob.addListener('onRewardedVideoAdRewarded', () => {
        rewardGranted = true;
      });

      const closeListener = await admob.addListener('onRewardedVideoAdClosed', () => {
        rewardListener.remove();
        closeListener.remove();
        resolve(rewardGranted ? 50 : 0);
      });

      await admob.showRewardVideoAd();
    } catch (err) {
      console.error('[AdMob] Rewarded ad error:', err);
      resolve(0);
    }
  });
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
const INTERSTITIAL_COOLDOWN = 60000;

export async function showInterstitialAd(): Promise<void> {
  const admob = await getAdMobPlugin();
  if (!admob) return;

  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN) return;

  try {
    await admob.prepareInterstitial({
      adId: AD_UNIT_IDS.INTERSTITIAL,
      isTesting: false,
    });
    await admob.showInterstitial();
    lastInterstitialTime = now;
  } catch (err) {
    console.error('[AdMob] Interstitial error:', err);
  }
}
