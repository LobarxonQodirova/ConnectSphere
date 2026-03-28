import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addIncomingMessage } from "../store/slices/messageSlice";

/**
 * Custom hook for managing a WebSocket connection with automatic
 * reconnection and JSON message handling.
 *
 * @param {string|null} url - WebSocket URL to connect to. Null disables the connection.
 * @param {object} options - Optional configuration.
 * @returns {{ sendJsonMessage, isConnected, lastMessage }}
 */
export default function useWebSocket(url, options = {}) {
  const { reconnectInterval = 3000, maxRetries = 5 } = options;
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const retriesRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        // Automatically dispatch incoming chat messages to the store
        if (data.type === "chat_message") {
          const threadId = url.match(/chat\/([^/]+)/)?.[1];
          if (threadId) {
            dispatch(
              addIncomingMessage({
                threadId,
                message: {
                  id: data.message_id,
                  sender: {
                    id: data.sender_id,
                    username: data.sender_username,
                  },
                  content: data.content,
                  message_type: data.message_type,
                  created_at: data.created_at,
                },
              })
            );
          }
        }
      } catch {
        // Non-JSON message, ignore
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      socketRef.current = null;

      // Attempt reconnection unless the close was intentional
      if (event.code !== 1000 && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setTimeout(connect, reconnectInterval);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url, reconnectInterval, maxRetries, dispatch]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounted");
      }
    };
  }, [connect]);

  const sendJsonMessage = useCallback((data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { sendJsonMessage, isConnected, lastMessage };
}
