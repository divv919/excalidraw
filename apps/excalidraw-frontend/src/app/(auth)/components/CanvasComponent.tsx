import { useState, useRef, useEffect } from "react";

type Shape = {
  type: "rect" | "circle";
  height: number;
  width: number;
  clientX: number;
  clientY: number;
};
const CanvasComponent = ({
  existingShapesState,
  socket,
  setExistingShapesState,
}: {
  existingShapesState: string[];
  setExistingShapesState: React.Dispatch<React.SetStateAction<string[]>>;
  socket: WebSocket;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);
  const [startXY, setStartXY] = useState({ clientX: 0, clientY: 0 });
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      setCanvasContext(canvas?.getContext("2d"));
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (!canvasRef.current || !canvasContext) {
      return;
    }
    canvasContext?.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    existingShapesState.map((shapeAsString: string) => {
      const { clientX, clientY, height, width } = JSON.parse(shapeAsString);
      canvasContext.strokeStyle = "white";

      canvasContext.strokeRect(clientX, clientY, width, height);
    });
  }, [existingShapesState, canvasContext]);

  const handleMove = (e: React.MouseEvent) => {
    // console.log("x moved : ", e.clientX, " y moved : ", e.clientY);
    if (!canvasRef.current || !canvasContext || !clicked) {
      return;
    }
    canvasContext?.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    existingShapesState.map((shapeAsString: string) => {
      const { clientX, clientY, height, width } = JSON.parse(shapeAsString);
      canvasContext.strokeRect(clientX, clientY, width, height);
    });
    const height = e.clientY - startXY.clientY;
    const width = e.clientX - startXY.clientX;

    canvasContext.strokeStyle = "white";
    canvasContext.strokeRect(startXY.clientX, startXY.clientY, width, height);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setClicked(false);
    const { clientX, clientY } = e;
    const height = clientY - startXY.clientY;
    const width = clientX - startXY.clientX;
    setExistingShapesState((prev) => [
      ...prev,
      JSON.stringify({
        type: "rect",
        height,
        width,
        clientX: startXY.clientX,
        clientY: startXY.clientY,
      }),
    ]);
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: 1,
        message: JSON.stringify({
          type: "rect",
          height,
          width,
          clientX: startXY.clientX,
          clientY: startXY.clientY,
        }),
      })
    );
  };

  return (
    <div className="h-screen w-screen overflow-scroll scrollbar-none">
      <canvas
        onMouseDown={({ clientX, clientY }) => {
          console.log("x start : ", clientX, " y start : ", clientY);
          setStartXY({ clientX, clientY });
          setClicked(true);
        }}
        onMouseMove={handleMove}
        ref={canvasRef}
        width={innerWidth}
        height={innerHeight}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};
export default CanvasComponent;
