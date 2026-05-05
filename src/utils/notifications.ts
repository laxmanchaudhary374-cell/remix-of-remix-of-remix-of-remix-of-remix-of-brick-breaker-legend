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

    // Cancel existing then schedule daily 9 AM
    try {
      const pending = await plugin.getPending();
      if (pending?.notifications?.length) {
        await plugin.cancel({ notifications: pending.notifications.map((n: any) => ({ id: n.id })) });
      }
    } catch {}

    const at = new Date();
    at.setHours(9, 0, 0, 0);
    if (at.getTime() < Date.now()) at.setDate(at.getDate() + 1);

    await plugin.schedule({
      notifications: [
        {
          id: 1001,
          title: '🎮 Your daily reward is ready!',
          body: 'Come collect your coins!',
          schedule: { at, repeats: true, every: 'day' },
        },
      ],
    });
  } catch (err) {
    console.error('[Notifications] Failed:', err);
  }
}
