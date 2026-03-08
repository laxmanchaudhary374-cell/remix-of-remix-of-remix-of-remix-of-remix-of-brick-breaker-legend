import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.neonbrickbreaker.ball',
  appName: 'Neon Brick Breaker Ball',
  webDir: 'dist',
  server: {
    url: 'https://9c49e9b8-4cc0-4111-ba31-1509ce46a7c9.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
