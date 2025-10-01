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
  const isSupported = "Notification" in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? window.Notification.permission : "denied",
  );
  const requestPermission = useCallback(async () => {
    if (isSupported && permission === "default") {
      const newPermission = await window.Notification.requestPermission();
      setPermission(newPermission);
    }
  }, [isSupported, permission]);

  const notify = useCallback(() => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser.");
      return false;
    }

    if (permission === "default") {
      console.warn("Permission not requested yet.");
      return false;
    }

    if (permission === "denied") {
      console.warn("User has denied notifications.");
      return false;
    }
    if (isSupported && permission === "granted") {
      const { title, options } = message[type];
      new window.Notification(title, options);
    }
  }, [isSupported, permission, type]);

  return {
    isSupported,
    permission,
    requestPermission,
    notify,
  };
}
