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

// Correct event names from @capacitor-community/admob v8 RewardAdPluginEvents enum
const EVT = {
  Loaded: 'onRewardedVideoAdLoaded',
  FailedToLoad: 'onRewardedVideoAdFailedToLoad',
  Showed: 'onRewardedVideoAdShowed',
  FailedToShow: 'onRewardedVideoAdFailedToShow',
  Dismissed: 'onRewardedVideoAdDismissed',
  Rewarded: 'onRewardedVideoAdReward',
} as const;

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
    await admob.initialize({ initializeForTesting: false });
    initialized = true;
    console.log('[AdMob] Initialized');
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
    return { ok: false, error: 'Ads only work in the installed app.' };
  }

  // Make sure AdMob is initialized
  await initAdMob();

  return new Promise(async (resolve) => {
    let settled = false;
    let rewardGranted = false;
    const listeners: any[] = [];

    const cleanup = () => {
      listeners.forEach(l => { try { l.remove(); } catch {} });
    };
    const finish = (r: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cleanup();
      resolve(r);
    };

    // 15s loading timeout
    const timeout = setTimeout(() => {
      finish({ ok: false, error: 'Ad not available - Try later' });
    }, 15000);

    try {
      listeners.push(await admob.addListener(EVT.Rewarded, (reward: any) => {
        rewardGranted = true;
        console.log('[AdMob] Rewarded event:', reward);
      }));
      listeners.push(await admob.addListener(EVT.Dismissed, () => {
        console.log('[AdMob] Dismissed, rewardGranted=', rewardGranted);
        finish({ ok: true, reward: rewardGranted ? 50 : 0 });
      }));
      listeners.push(await admob.addListener(EVT.FailedToLoad, (err: any) => {
        console.error('[AdMob] FailedToLoad:', err);
        finish({ ok: false, error: err?.message || err?.errorMessage || 'Ad not available - Try later' });
      }));
      listeners.push(await admob.addListener(EVT.FailedToShow, (err: any) => {
        console.error('[AdMob] FailedToShow:', err);
        finish({ ok: false, error: err?.message || err?.errorMessage || 'Ad failed to show. Try again.' });
      }));

      await admob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED_COINS,
        isTesting: false,
      });
      // showRewardVideoAd resolves with the reward item when the user earns it
      const rewardItem = await admob.showRewardVideoAd();
      if (rewardItem && (rewardItem.amount > 0 || rewardItem.type)) {
        rewardGranted = true;
      }
    } catch (err: any) {
      console.error('[AdMob] Rewarded ad error:', err);
      finish({ ok: false, error: err?.message || 'Ad not available - Try later' });
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
