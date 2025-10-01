import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "../useNotifications";
import { TimerMode } from "../../types/timer";

describe("useNotifications", () => {
  const mockNotification = vi.fn();
  const mockRequestPermission = vi.fn();

  describe("browser support", () => {
    it("should return true when Notification API is supported", () => {
      Object.defineProperty(window, "Notification", {
        value: mockNotification,
        writable: true,
        configurable: true,
      });
      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(true);
    });

    it("should return false when Notification API is not supported", () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(true);
    });
  });

  describe("permission handling", () => {
    beforeEach(() => {
      Object.defineProperty(window, "Notification", {
        value: mockNotification,
        writable: true,
        configurable: true,
      });
    });

    it('should return permission "granted" when it is granted', () => {
      Object.defineProperty(window.Notification, "permission", {
        value: "granted",
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe("granted");
    });

    it('should return permission "denied" when it is denied', () => {
      Object.defineProperty(window.Notification, "permission", {
        value: "denied",
        writable: true,
        configurable: true,
      });

      // Act & Assert
      const { result } = renderHook(() => useNotifications());
      expect(result.current.permission).toBe("denied");
    });

    it('should return permission: "default" when permission not yet requested', () => {
      // Arrange: Set permission to default
      Object.defineProperty(window.Notification, "permission", {
        value: "default",
        writable: true,
        configurable: true,
      });

      // Act & Assert
      const { result } = renderHook(() => useNotifications());
      expect(result.current.permission).toBe("default");
    });

    it('should request permission when permission is "default"', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      window.Notification.requestPermission = mockRequestPermission;

      Object.defineProperty(window.Notification, "permission", {
        value: "default",
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotifications());

      await result.current.requestPermission();

      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  describe("shows notification", () => {
    beforeEach(() => {
      Object.defineProperty(window, "Notification", {
        value: mockNotification,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window.Notification, "permission", {
        value: "granted",
        writable: true,
        configurable: true,
      });
    });

    it("should create a notification when permission is granted", () => {
      const { result } = renderHook(() => useNotifications());
      const title = "Focus Time is over!";
      const options = {
        body: "Take a break and stretch your legs.",
      };
      act(() => {
        result.current.notify();
      });

      expect(mockNotification).toHaveBeenCalledWith(title, options);
    });

	it("should create a notification when break timer is over", () => {
      const { result } = renderHook(() => useNotifications({type: TimerMode.BREAK}));
      const title = "BREAK is over!";
      const options = {
        body: "Time to get back to work.",
      };
      act(() => {
        result.current.notify();
      });

      expect(mockNotification).toHaveBeenCalledWith(title, options);

	});
  });
});
