/**
 * AdMob integration via @capacitor-community/admob
 *
 * TODO: Replace the placeholder ad unit IDs with your actual
 * AdMob ad unit IDs before publishing.
 */
import { Capacitor } from '@capacitor/core';

// ============================
// AD UNIT ID CONFIGURATION
// ============================
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

/**
 * Initialize AdMob SDK.
 * Call once at app startup.
 */
export async function initAdMob(): Promise<boolean> {
  const admob = await getAdMobPlugin();
  if (!admob || initialized) return initialized;

  try {
    await admob.initialize({
      // TODO: Set to false for production, true for testing
      initializeForTesting: true,
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[AdMob] Failed to init:', err);
    return false;
  }
}

/**
 * Show a rewarded video ad and return the coin reward.
 * @returns Number of coins earned (50), or 0 if ad was skipped/failed
 */
export async function showRewardedAd(): Promise<number> {
  const admob = await getAdMobPlugin();

  // Fallback for web preview: simulate a 5-second ad
  if (!admob) {
    console.log('[AdMob] Web preview — simulating rewarded ad');
    return new Promise((resolve) => {
      setTimeout(() => resolve(50), 5000);
    });
  }

  try {
    // Prepare the rewarded ad
    await admob.prepareRewardVideoAd({
      adId: AD_UNIT_IDS.REWARDED_COINS,
      isTesting: true, // TODO: Set to false for production
    });

    // Show the rewarded ad
    const result = await admob.showRewardVideoAd();

    // The ad was completed — award coins
    if (result) {
      return 50;
    }
    return 0;
  } catch (err) {
    console.error('[AdMob] Rewarded ad error:', err);
    return 0;
  }
}
