import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.neonbrickbreaker.ball',
  appName: 'Neon Brick Breaker Ball',
  webDir: 'dist',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-6637721495380199~8632290443',
    },
  },
};

export default config;
