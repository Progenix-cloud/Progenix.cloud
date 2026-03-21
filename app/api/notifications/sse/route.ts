import { NextResponse } from "next/server";
import { notificationsBus } from "@/lib/notifications-bus";
import { apiError, withRBAC } from "@/lib/api-utils";

export const GET = withRBAC(
  "notification",
  "read",
  async (request: Request, _ctx, user) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || user._id;
    if (!userId) {
      return apiError("MISSING_USER", "userId required", 400);
    }
    if (userId !== user._id && user.role !== "admin") {
      return apiError("FORBIDDEN", "Forbidden", 403);
    }

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "connected",
            timestamp: Date.now(),
          })}\n\n`
        );

        const encoder = new TextEncoder();
        const handleNotification = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        notificationsBus.subscribe(userId, handleNotification);

        const heartbeat = setInterval(() => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        }, 30000);

        request.signal.addEventListener("abort", () => {
          notificationsBus.unsubscribe(userId, handleNotification);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
);
