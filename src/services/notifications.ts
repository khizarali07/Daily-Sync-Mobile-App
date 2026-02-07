import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { Task } from "./api";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationService {
  registerForPushNotifications: () => Promise<string | null>;
  scheduleTaskNotification: (task: Task) => Promise<string | null>;
  scheduleMultipleTaskNotifications: (tasks: Task[]) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      // Set notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4f46e5",
        });

        await Notifications.setNotificationChannelAsync("tasks", {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4f46e5",
          sound: "default",
        });
      }

      return "success";
    } catch (error) {
      console.error("Error registering for notifications:", error);
      return null;
    }
  }

  async scheduleTaskNotification(task: Task): Promise<string | null> {
    try {
      // Parse task time (format: "HH:MM")
      const [hours, minutes] = task.time.split(":").map(Number);
      
      // Get today's date and set the task time
      const now = new Date();
      const taskDate = new Date(task.date);
      taskDate.setHours(hours, minutes, 0, 0);

      // Only schedule if the task is in the future
      if (taskDate <= now) {
        return null;
      }

      // Calculate seconds until the notification
      const secondsUntil = Math.floor((taskDate.getTime() - now.getTime()) / 1000);

      if (secondsUntil <= 0) {
        return null;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${task.name}`,
          body: task.category ? `Time for ${task.category}` : "It's time for your task!",
          data: { taskId: task.id },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
          repeats: false,
        },
      });

      console.log(`Scheduled notification for ${task.name} at ${task.time}`);
      return id;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  async scheduleMultipleTaskNotifications(tasks: Task[]): Promise<void> {
    // Cancel existing notifications first
    await this.cancelAllNotifications();

    // Schedule notifications for incomplete tasks only
    const incompleteTasks = tasks.filter((t) => !t.isCompleted);

    for (const task of incompleteTasks) {
      await this.scheduleTaskNotification(task);
    }

    console.log(`Scheduled ${incompleteTasks.length} task notifications`);
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Cancelled all notifications");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }
}

export const notificationService = new NotificationServiceImpl();

// Hook to handle notification responses
export function useNotificationObserver(
  onNotificationReceived?: (taskId: string) => void
) {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  if (lastNotificationResponse) {
    const taskId = lastNotificationResponse.notification.request.content.data?.taskId as string;
    if (taskId && onNotificationReceived) {
      onNotificationReceived(taskId);
    }
  }
}
