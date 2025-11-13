"use client";

import { useEffect, useRef, useState } from "react";
import CanvasComponent from "./CanvasComponent";
import { TOKEN, WEBSOCKET_URL } from "@/config/variables";

function CanvasComponentForWS({
  existingShapes,
}: {
  existingShapes: string[];
}) {
  const [socketConnection, setSocketConnection] = useState<WebSocket | null>(
    null
  );
  const [existingShapesState, setExistingShapesState] =
    useState(existingShapes);
  useEffect(() => {
    const socket = new WebSocket(`${WEBSOCKET_URL}?token=${TOKEN}`);
    socket.onopen = () => {
      setSocketConnection(socket);
      socket.send(JSON.stringify({ type: "join_room", roomId: 1 }));
    };
    socket.onmessage = (e) => {
      const parsed = JSON.parse(e.data);
      setExistingShapesState((prev) => [...prev, parsed.message]);
    };
  }, [existingShapes]);

  useEffect(() => {
    console.log(" state array of existing shapes  : ", existingShapesState);
  }, [existingShapesState]);

  if (!socketConnection) {
    return <div>Connecting to ws</div>;
  }
  return (
    <CanvasComponent
      existingShapesState={existingShapesState}
      socket={socketConnection}
      setExistingShapesState={setExistingShapesState}
    />
  );
}

export default CanvasComponentForWS;
