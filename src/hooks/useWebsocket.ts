import { useCallback, useEffect, useRef, useState } from 'react';

const RECONNECT_DELAY = 5000;

const useWebSocket = <T,>(url: string, topic: string, onMessage: (data: T) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(onMessage);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualReconnectRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      try {
        ws.send(JSON.stringify({ op: 'subscribe', args: [topic] }));
      } catch (error) {
        console.warn(`Failed to send subscribe payload for topic ${topic}`, error);
      }
    };

    ws.onmessage = (event) => {
      let parsed: T | null = null;
      try {
        parsed = JSON.parse(event.data) as T;
      } catch (error) {
        console.error(`WebSocket message parse error for topic ${topic}:`, error);
        return;
      }

      if (parsed === null || parsed === undefined) {
        return;
      }

      messageHandlerRef.current(parsed);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      const delay = manualReconnectRef.current ? 0 : RECONNECT_DELAY;
      manualReconnectRef.current = false;
      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error on ${topic}:`, error);
      ws.close();
    };
  }, [clearReconnectTimer, topic, url]);

  const scheduleImmediateConnect = useCallback(() => {
    clearReconnectTimer();
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, 0);
  }, [clearReconnectTimer, connect]);

  useEffect(() => {
    scheduleImmediateConnect();
    return () => {
      clearReconnectTimer();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      } else {
        wsRef.current = null;
      }
    };
  }, [scheduleImmediateConnect, clearReconnectTimer]);

  const resubscribe = useCallback(() => {
    manualReconnectRef.current = true;
    if (wsRef.current) {
      wsRef.current.close();
    } else {
      scheduleImmediateConnect();
    }
  }, [scheduleImmediateConnect]);

  return { isConnected, resubscribe };
};

export default useWebSocket;
