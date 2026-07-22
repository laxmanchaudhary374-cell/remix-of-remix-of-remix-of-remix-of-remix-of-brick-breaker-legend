import { registerPlugin } from '@capacitor/core';

export interface ChartboostPlugin {
  initialize(options: { appId: string; appSignature: string }): Promise<void>;
  showBanner(options: { location: string }): Promise<void>;
  hideBanner(): Promise<void>;
  showInterstitial(options: { location: string }): Promise<void>;
  showRewarded(options: { location: string }): Promise<void>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
}

const Chartboost = registerPlugin<ChartboostPlugin>('ChartboostPlugin');

export default Chartboost;
