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

export type RewardedAdResult =
  | { ok: true; reward: number }
  | { ok: false; error: string };

export async function showRewardedAd(): Promise<RewardedAdResult> {
  const admob = await getAdMobPlugin();
  if (!admob) {
    return { ok: false, error: 'Ads are only available in the installed app.' };
  }

  return new Promise(async (resolve) => {
    let settled = false;
    const finish = (r: RewardedAdResult) => { if (!settled) { settled = true; resolve(r); } };

    // Hard timeout — never let the UI spin forever
    const timeout = setTimeout(() => {
      finish({ ok: false, error: 'Ad took too long to load. Check your internet and try again.' });
    }, 15000);

    try {
      let rewardGranted = false;

      const rewardListener = await admob.addListener('onRewardedVideoAdRewarded', () => {
        rewardGranted = true;
      });
      const closeListener = await admob.addListener('onRewardedVideoAdClosed', () => {
        clearTimeout(timeout);
        rewardListener.remove();
        closeListener.remove();
        finish({ ok: true, reward: rewardGranted ? 50 : 0 });
      });
      const failListener = await admob.addListener('onRewardedVideoAdFailedToLoad', (err: any) => {
        clearTimeout(timeout);
        rewardListener.remove();
        closeListener.remove();
        failListener.remove();
        finish({ ok: false, error: err?.message || 'No ad available right now. Try again in a moment.' });
      });

      await admob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED_COINS,
        isTesting: false,
      });
      await admob.showRewardVideoAd();
    } catch (err: any) {
      clearTimeout(timeout);
      console.error('[AdMob] Rewarded ad error:', err);
      finish({ ok: false, error: err?.message || 'Ad failed to load. Please try again later.' });
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
