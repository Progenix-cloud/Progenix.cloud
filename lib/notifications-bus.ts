type Callback = (data: any) => void;

const subscribers: Map<string, Set<Callback>> = new Map();

export const notificationsBus = {
  subscribe(userId: string, cb: Callback) {
    if (!subscribers.has(userId)) subscribers.set(userId, new Set());
    subscribers.get(userId)!.add(cb);
  },
  unsubscribe(_userId: string, _cb: Callback) {
    const set = subscribers.get(_userId);
    if (!set) return;
    set.delete(_cb);
    if (set.size === 0) subscribers.delete(_userId);
  },
  publish(userId: string, data: any) {
    const set = subscribers.get(userId);
    if (!set) return;
    for (const cb of Array.from(set)) {
      try {
        cb(data);
      } catch (e) {
        console.error("notifications-bus callback error", e);
      }
    }
  },
  publishToAll(data: any) {
    for (const [userId, set] of subscribers.entries()) {
      for (const cb of Array.from(set)) {
        try {
          cb(data);
        } catch (e) {
          console.error("notifications-bus callback error", e);
        }
      }
    }
  },
};
