import { mockDb } from "@/lib/mock-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`data: {"type":"connected"}\n\n`));

      const unsubscribe = mockDb.subscribeSSE((data: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        } catch {
          // Stream might be closed
        }
      });

      // Keepalive ping every 15 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: keepalive\n\n`));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
