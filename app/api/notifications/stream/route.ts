import { NextRequest } from "next/server";
import { notificationsBus } from "@/lib/notifications-bus";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return new Response("Missing userId", { status: 400 });

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

        // subscribe
        notificationsBus.subscribe(userId, onMessage);

        // heartbeat
        const iv = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch (e) {
            console.error(e);
          }
        }, 25000);

        // cleanup on client disconnect
        const abort = () => {
          clearInterval(iv);
          notificationsBus.unsubscribe(userId, onMessage);
          try {
            controller.close();
          } catch (e) {
            // ignore error on close
          }
        };

        // if running in Node/edge, tie to request signal when available
        try {
          // request.signal is available in Next.js
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
    return new Response("Internal error", { status: 500 });
  }
}
