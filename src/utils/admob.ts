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
    await admob.initialize({
      initializeForTesting: true,
    });
    initialized = true;
    console.log('[AdMob] Initialized successfully');
    return true;
  } catch (err) {
    console.error('[AdMob] Failed to init:', err);
    return false;
  }
}

export type RewardedAdResult = { ok: boolean; reward: number; error?: string };

export async function showRewardedAd(): Promise<RewardedAdResult> {
  const admob = await getAdMobPlugin();
  if (!admob) {
    return { ok: false, reward: 0, error: 'Ads only work on real devices.' };
  }

  await initAdMob();

  return new Promise(async (resolve) => {
    let settled = false;
    let rewardGranted = false;
    const listeners: any[] = [];

    const finish = (res: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      listeners.forEach(l => l.remove());
      resolve(res);
    };

    // 20s timeout
    const timeout = setTimeout(() => {
      finish({ ok: false, reward: 0, error: 'Ad timed out. Check your internet.' });
    }, 20000);

    try {
      // Listen for ALL possible reward event names to be safe
      listeners.push(await admob.addListener('onRewardedVideoAdReward', () => { rewardGranted = true; }));
      listeners.push(await admob.addListener('onRewardedVideoAdRewarded', () => { rewardGranted = true; }));
      listeners.push(await admob.addListener('rewarded', () => { rewardGranted = true; }));

      listeners.push(await admob.addListener('onRewardedVideoAdDismissed', () => {
        finish({ ok: true, reward: rewardGranted ? 50 : 0 });
      }));

      listeners.push(await admob.addListener('onRewardedVideoAdFailedToLoad', (err: any) => {
        finish({ ok: false, reward: 0, error: err.message || 'No ad available right now.' });
      }));

      await admob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED_COINS,
        isTesting: true,
      });

      await admob.showRewardVideoAd();
    } catch (err: any) {
      finish({ ok: false, reward: 0, error: err.message || 'Ad failed to start.' });
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
      isTesting: true,
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
