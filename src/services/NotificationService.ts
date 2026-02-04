import * as Notifications from 'expo-notifications';
import { UserSettings } from '../types';
import { Alert, Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  scheduleReminders: async (settings: UserSettings) => {
    if (!settings.enableNotifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) {
      console.log("No notification permission");
      return;
    }

    // Cancel existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for each day in settings
    for (const scheduleItem of settings.schedule) {
      const [hours, minutes] = scheduleItem.time.split(':').map(Number);

      // Calculate trigger
      // Expo Notifications 'weekday': 1 = Sunday, 7 = Saturday.
      // Our settings: 1 = Monday, 7 = Sunday.
      // Conversion:
      // Mon(1) -> 2
      // Tue(2) -> 3
      // ...
      // Sat(6) -> 7
      // Sun(7) -> 1
      const weekday = scheduleItem.dayIndex === 7 ? 1 : scheduleItem.dayIndex + 1;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🏋️ Alerte Sport !",
          body: "C'est l'heure de votre séance prévue. Go !",
          sound: true,
        },
        trigger: {
          weekday,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }

    // Add a generic motivational notification on Sunday evening if no sport done?
    // Keeping it simple for now as requested.

    console.log("Notifications scheduled based on settings.");
  }
};
