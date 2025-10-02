import { useState, useCallback } from "react";
import { TimerMode } from "../types/timer";

interface UseNotificationsOptions {
  type?: TimerMode;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { type = TimerMode.FOCUS } = options;
  const message = {
    [TimerMode.FOCUS]: {
      title: "Focus Time is over!",
      options: {
        body: "Take a break and stretch your legs.",
      },
    },
    [TimerMode.BREAK]: {
      title: "BREAK is over!",
      options: {
        body: "Time to get back to work.",
      },
    },
  };
  const isSupported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? window.Notification.permission : "denied",
  );
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    if (window.Notification.permission !== "default") return true;

    const newPermission = await window.Notification.requestPermission();
    setPermission(newPermission);
    return newPermission === "granted";
  }, [isSupported]);

  const notify = useCallback((): boolean => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser.");
      return false;
    }

    const current = window.Notification.permission;
    if (current !== "granted") {
      console.warn(`Notification permission is "${current}".`);
      return false;
    }
    const { title, options } = message[type];
    new window.Notification(title, options);
    return true;
  }, [isSupported, type]);

  return {
    isSupported,
    permission,
    requestPermission,
    notify,
  };
}
