import { Capacitor } from '@capacitor/core';

let LocalNotifications: any = null;

async function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!LocalNotifications) {
    const mod = await import('@capacitor/local-notifications');
    LocalNotifications = mod.LocalNotifications;
  }
  return LocalNotifications;
}

export async function initDailyReminder(): Promise<void> {
  const plugin = await getPlugin();
  if (!plugin) return;

  try {
    const perm = await plugin.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await plugin.requestPermissions();
      if (req.display !== 'granted') return;
    }

    try {
      await plugin.cancel({ notifications: [{ id: 1001 }] });
    } catch {}

    const MESSAGES = [
      "Missing you! Are you bored? Come break some bricks!",
      "Your high score is in danger... Play now!",
      "Ready for a quick game? Just 2 minutes!",
      "Don't forget your coins! Come collect more.",
      "One more level? You can do it!",
      "Feeling bored? Let's destroy some bricks!",
      "Your paddle misses you. Come back!",
      "New challenge waiting for you!",
      "Still the champion? Prove it!",
      "Quick game time! Open now."
    ];

    const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    await plugin.schedule({
      notifications: [
        {
          id: 1001,
          title: "Brick Breaker Legend",
          body: randomMessage,
          schedule: {
            at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          }
        }
      ]
    });
  } catch (err) {
    console.warn('[Notifications] Failed:', err);
  }
}