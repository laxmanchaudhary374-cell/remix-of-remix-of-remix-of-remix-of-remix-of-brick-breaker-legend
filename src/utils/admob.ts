import { Capacitor } from '@capacitor/core';

// Ad unit IDs — in production these should be provided via build-time
// environment variables (VITE_ADMOB_REWARDED, etc.) rather than hardcoded.
export const AD_UNIT_IDS = {
  REWARDED_COINS: import.meta.env.VITE_ADMOB_REWARDED || 'ca-app-pub-6637721495380199/7860262690',
  INTERSTITIAL: import.meta.env.VITE_ADMOB_INTERSTITIAL || 'ca-app-pub-6637721495380199/9759645640',
  BANNER: import.meta.env.VITE_ADMOB_BANNER || 'ca-app-pub-6637721495380199/1558102866',
} as const;

let AdMob: any = null;
let initialized = false;

async function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!AdMob) {
    try {
      const mod = await import('@capacitor-community/admob');
      AdMob = mod.AdMob;
    } catch (e) {
      console.error('[AdMob] Import failed:', e);
      return null;
    }
  }
  return AdMob;
}

export async function initAdMob(): Promise<boolean> {
  const admob = await getPlugin();
  if (!admob || initialized) return initialized;
  try {
    await admob.initialize({ initializeForTesting: false });
    initialized = true;
    console.log('[AdMob] Initialized successfully');
    return true;
  } catch (err) {
    console.error('[AdMob] Init failed:', err);
    return false;
  }
}

export type RewardedAdResult =
  | { ok: true; reward: number }
  | { ok: false; error: string };

export async function showRewardedAd(): Promise<RewardedAdResult> {
  const admob = await getPlugin();
  if (!admob) {
    return { ok: false, error: 'Ads only available in installed app.' };
  }
  if (!initialized) await initAdMob();

  return new Promise(async (resolve) => {
    let settled = false;
    const finish = (r: RewardedAdResult) => {
      if (!settled) { settled = true; resolve(r); }
    };

    const timeout = setTimeout(() => {
      finish({ ok: false, error: 'Ad timeout. Check internet and try again.' });
    }, 30000);

    try {
      let rewardGranted = false;

      const rewardListener = await admob.addListener('rewarded', (reward: any) => {
        console.log('[AdMob] Reward received:', reward);
        rewardGranted = true;
      });

      const dismissedListener = await admob.addListener('rewardedVideoDismissed', () => {
        console.log('[AdMob] Ad dismissed, rewardGranted=', rewardGranted);
        clearTimeout(timeout);
        rewardListener.remove();
        dismissedListener.remove();
        finish({ ok: true, reward: rewardGranted ? 50 : 0 });
      });

      await admob.prepareRewarded({ adId: AD_UNIT_IDS.REWARDED_COINS });
      await admob.showRewarded();

    } catch (err: any) {
      clearTimeout(timeout);
      console.error('[AdMob] Error:', err);
      finish({ ok: false, error: err?.message || 'Ad failed to load.' });
    }
  });
}

export async function showBannerAd(): Promise<void> {
  const admob = await getPlugin();
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
  const admob = await getPlugin();
  if (!admob) return;
  const now = Date.now();
  if (now - lastInterstitialTime < 60000) return;
  try {
    await admob.prepareInterstitial({ adId: AD_UNIT_IDS.INTERSTITIAL });
    await admob.showInterstitial();
    lastInterstitialTime = now;
  } catch (err) {
    console.error('[AdMob] Interstitial error:', err);
  }
}
