export type Shape =
  | "rectangle"
  | "ellipse"
  | "pencil"
  | "line"
  | "arrow"
  | "text"
  | "hand";

export type Content = {
  type: Shape;
  text?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points?: Json;
  color: CanvasRenderingContext2D["strokeStyle"];
};
