"use client";

import CanvasSidebar from "@/app/components/CanvasSidebar";
import createCanvas from "@/app/lib/draw";
import { Content, Shape } from "@/types/canvas";
import { useState, useRef, useEffect } from "react";
import CanvasTopBar from "./CanvasTopBar";
import ZoomIndicator from "./ZoomIndicator";
const shapes: Shape[] = [
  "rectangle",
  "ellipse",
  "pencil",
  "line",
  "arrow",
  "text",
  "hand",
];

const CanvasComponent = ({
  existingShapes,
  socket,
  setExistingShapes,
}: {
  existingShapes: Content[];
  setExistingShapes: React.Dispatch<React.SetStateAction<Content[]>>;
  socket: WebSocket;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<ReturnType<typeof createCanvas> | null>(
    null
  );
  const [currentColor, setCurrentColor] =
    useState<CanvasRenderingContext2D["strokeStyle"]>("white");
  const [currentShape, setCurrentShape] =
    useState<Content["type"]>("rectangle");
  const [startXY, setStartXY] = useState({ x: 0, y: 0 });
  const [endXY, setEndXY] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosition = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[]>([]);

  const camera = useRef({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  useEffect(() => {
    const disableZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", disableZoom, { passive: false });

    return () => {
      document.removeEventListener("wheel", disableZoom);
    };
  }, []);

  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 5;
  const MAX_CAMERA_X = 2000;
  const MAX_CAMERA_Y = 2000;
  const MIN_CAMERA_X = -500;
  const MIN_CAMERA_Y = -500;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    canvas.redraw(camera, existingShapes);
  }, [zoomLevel]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      setCanvas(createCanvas(canvas));
    }
  }, [canvasRef.current]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4", "5", "6", "7"].includes(e.key)) {
        setCurrentShape(shapes[Number(e.key) - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    canvas.clearCanvas();
    existingShapes.map((shape: Content) => {
      const renderer = canvas.shapeRenderer[shape.type];
      renderer({
        startX: shape.startX ?? 0,
        startY: shape.startY ?? 0,
        endX: shape.endX ?? 0,
        endY: shape.endY ?? 0,
        color: shape.color,
        points: shape.points ?? [],
      });
    });
  }, [existingShapes, canvas]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvas) {
      return;
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      camera.current.x = Math.min(
        Math.max(camera.current.x + deltaX, MIN_CAMERA_X),
        MAX_CAMERA_X
      );
      camera.current.y = Math.min(
        Math.max(camera.current.y + deltaY, MIN_CAMERA_Y),
        MAX_CAMERA_Y
      );
      canvas.redraw(camera, existingShapes);
      return;
    }

    if (isDrawing) {
      canvas.getContext().setTransform(1, 0, 0, 1, 0, 0);
      canvas.clearCanvas();
      canvas
        .getContext()
        .setTransform(
          camera.current.scale,
          0,
          0,
          camera.current.scale,
          camera.current.x,
          camera.current.y
        );
      existingShapes.map((shape: Content) => {
        const renderer = canvas.shapeRenderer[shape.type];
        renderer(shape);
        return;
      });
      const worldX = (e.clientX - camera.current.x) / camera.current.scale;
      const worldY = (e.clientY - camera.current.y) / camera.current.scale;
      setEndXY({ x: worldX, y: worldY });
      canvas.shapeRenderer[currentShape]({
        startX: startXY.x,
        startY: startXY.y,
        endX: worldX,
        endY: worldY,
        points: penPoints,
        color: currentColor,
      });
      if (currentShape === "pencil") {
        setPenPoints((prev) => [...prev, { x: worldX, y: worldY }]);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (currentShape === "hand") {
      setIsDragging(false);
      return;
    }

    setIsDrawing(false);
    const worldX = (e.clientX - camera.current.x) / camera.current.scale;
    const worldY = (e.clientY - camera.current.y) / camera.current.scale;
    setEndXY({ x: worldX, y: worldY });

    setExistingShapes([
      ...existingShapes,
      {
        startX: startXY?.x || 0,
        startY: startXY?.y || 0,
        endX: endXY.x || 0,
        endY: endXY.y || 0,
        type: currentShape,
        color: currentColor,
        points: currentShape === "pencil" ? penPoints : [],
      },
    ]);

    setPenPoints([]);
    setStartXY({ x: 0, y: 0 });
    setEndXY({ x: 0, y: 0 });

    socket.send(
      JSON.stringify({
        color: currentColor,
        type: currentShape,
        endX: endXY.x,
        endY: endXY.y,
        startX: startXY.x,
        startY: startXY.y,
        points: penPoints,
      })
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentShape === "hand") {
      setIsDragging(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const worldX = (e.clientX - camera.current.x) / camera.current.scale;
    const worldY = (e.clientY - camera.current.y) / camera.current.scale;
    setStartXY({ x: worldX, y: worldY });

    if (currentShape === "pencil") {
      console.log("penpoints", penPoints);
      setPenPoints((prev) => [...prev, { x: worldX, y: worldY }]);
    }
    setIsDrawing(true);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!canvas) {
      return;
    }
    if (!e.ctrlKey) {
      const changeX = camera.current.x - e.deltaX;
      const changeY = camera.current.y - e.deltaY;

      camera.current.x = Math.min(
        Math.max(changeX, MIN_CAMERA_X),
        MAX_CAMERA_X
      );
      camera.current.y = Math.min(
        Math.max(changeY, MIN_CAMERA_Y),
        MAX_CAMERA_Y
      );
      canvas.redraw(camera, existingShapes);

      return;
    }
    const zoomIntensity = 0.05;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const direction = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = 1 + direction * zoomIntensity;

    const prevScale = camera.current.scale;
    let newScale = prevScale * zoomFactor;

    newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));
    const actualZoom = newScale / prevScale;

    // WORLD COORDS of the cursor
    const worldX = (mouseX - camera.current.x) / prevScale;
    const worldY = (mouseY - camera.current.y) / prevScale;

    // APPLY SCALE
    camera.current.scale = newScale;
    setZoomLevel(newScale);

    camera.current.x = mouseX - worldX * newScale;
    camera.current.y = mouseY - worldY * newScale;

    canvas.redraw(camera, existingShapes);
  };

  return (
    <div className="h-screen w-screen  scrollbar-none">
      <canvas
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`bg-neutral-900 h-full w-full ${
          currentShape === "hand"
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-crosshair"
        }`}
        style={{
          // imageRendering: "pixelated",
          touchAction: "none",
        }}
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
      />
      <ZoomIndicator
        MAX_ZOOM={MAX_ZOOM}
        MIN_ZOOM={MIN_ZOOM}
        camera={camera}
        setZoomLevel={setZoomLevel}
        zoomLevel={zoomLevel}
      />
      <CanvasTopBar
        shapes={shapes}
        currentShape={currentShape}
        setCurrentShape={setCurrentShape}
      />
      <CanvasSidebar
        setCurrentColor={setCurrentColor}
        currentColor={currentColor}
      />
    </div>
  );
};
export default CanvasComponent;
