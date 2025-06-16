"use client";

import { useEffect, useRef, useState } from "react";
import { WEBSOCKET_URL, TOKEN } from "../config";
interface Message {
  id: number;
  userId: string;
  message: string;
  created_at: Date;
  roomId: number;
}
export const ChatComponentClient = ({ messages }: { messages: Message[] }) => {
  const serverRef = useRef<WebSocket | null>(null);
  const [msgToShow, setMsgToShow] = useState(messages);
  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_URL + "?token=" + TOKEN);
    serverRef.current = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join_room", roomId: 1 }));
    };
    socket.onmessage = (ev) => {
      //   messages.push(ev.data);
      const parsed = JSON.parse(ev.data);
      setMsgToShow((prev) => [...prev, parsed]);
    };
  }, []);
  useEffect(() => {
    console.log("messages to show arr : ", msgToShow);
  }, [msgToShow]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ol>
        {msgToShow.map((message, idx) => {
          return <li key={idx}> new {message.message}</li>;
        })}
      </ol>
      <label htmlFor="chat-box">Enter your message</label>
      <input id="chat-box" />
    </div>
  );
};
