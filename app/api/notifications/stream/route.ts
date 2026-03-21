import { notificationsBus } from "@/lib/notifications-bus";
import { apiError, withRBAC } from "@/lib/api-utils";

export const GET = withRBAC(
  "notification",
  "read",
  async (request: Request, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId") || user._id;
      if (!userId) {
        return apiError("MISSING_USER", "Missing userId", 400);
      }
      if (userId !== user._id && user.role !== "admin") {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        start(controller) {
          const onMessage = (data: any) => {
            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            } catch (e) {
              console.error(e);
            }
          };

          notificationsBus.subscribe(userId, onMessage);

          const iv = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`: heartbeat\n\n`));
            } catch (e) {
              console.error(e);
            }
          }, 25000);

          const abort = () => {
            clearInterval(iv);
            notificationsBus.unsubscribe(userId, onMessage);
            try {
              controller.close();
            } catch (e) {
              // ignore error on close
            }
          };

          try {
            request.signal.addEventListener("abort", abort);
          } catch (e) {
            // ignore if not available
          }
        },
        cancel() {
          // noop
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      console.error("SSE stream error", error);
      return apiError("STREAM_FAILED", "Internal error", 500);
    }
  }
);
