import { useEffect, useRef, useCallback, useState } from "react";

type WSStatus = "connecting" | "open" | "closed" | "error";

interface UseWebSocketOptions {
  onMessage: (data: any) => void;
  enabled?: boolean;
  maxReconnectDelay?: number;
  debug?: boolean;
}

export function useWebSocket(
  url: string | null,
  { onMessage, enabled = true, maxReconnectDelay = 15000, debug = false }: UseWebSocketOptions
) {
  const [status, setStatus] = useState<WSStatus>("closed");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const log = (...args: any[]) => {
    if (debug) console.log("[WS]", ...args);
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!url || !enabled) {
      log("skipping connect — url:", url, "enabled:", enabled);
      return;
    }

    log("connecting to", url);
    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      log("connection OPEN");
      reconnectAttempt.current = 0;
      setStatus("open");
    };

    ws.onmessage = (event) => {
      log("message received:", event.data);
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      onMessageRef.current(data);
    };

    ws.onerror = (err) => {
      log("connection ERROR", err);
      setStatus("error");
    };

    ws.onclose = (event) => {
      log("connection CLOSED — code:", event.code, "reason:", event.reason);
      setStatus("closed");
      wsRef.current = null;
      if (!enabled) return;

      const delay = Math.min(1000 * 2 ** reconnectAttempt.current, maxReconnectDelay);
      log(`reconnecting in ${delay}ms (attempt ${reconnectAttempt.current + 1})`);
      reconnectAttempt.current += 1;
      clearReconnectTimer();
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, [url, enabled, maxReconnectDelay, debug]);

  useEffect(() => {
    if (!enabled || !url) {
      wsRef.current?.close();
      clearReconnectTimer();
      return;
    }
    connect();
    return () => {
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      log("cannot send, socket not open. readyState:", wsRef.current?.readyState);
    }
  }, [debug]);

  return { status, send };
} 