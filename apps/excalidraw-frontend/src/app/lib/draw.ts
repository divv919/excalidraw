import { Content, Shape } from "@/types/canvas";

export class Canvas {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to acquire 2D rendering context.");
    }
    this.ctx = context;
  }

  setStrokeStyle(style: CanvasRenderingContext2D["strokeStyle"]) {
    this.ctx.strokeStyle = style;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  drawRectangle(
    x: number,
    y: number,
    endX: number,
    endY: number,
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    this.setStrokeStyle(strokeStyle);
    let radius = 7;

    const height = endY - y;
    const width = endX - x;
    let rx = x;
    let ry = y;
    let rw = width;
    let rh = height;

    if (rw < 0) {
      rx = x + rw; // shift x back
      rw = Math.abs(rw);
    }
    if (rh < 0) {
      ry = y + rh; // shift y up
      rh = Math.abs(rh);
    }

    if (rh < 10) {
      radius = 0;
    }

    if (rw < 10) {
      radius = 0;
    }
    const context = this.ctx;

    context.beginPath();
    context.moveTo(rx, ry + radius);

    context.arcTo(rx, ry + rh, rx + radius, ry + rh, radius);
    context.arcTo(rx + rw, ry + rh, rx + rw, ry + rh - radius, radius);
    context.arcTo(rx + rw, ry, rx + rw - radius, ry, radius);
    context.arcTo(rx, ry, rx, ry + radius, radius);

    context.stroke();
  }

  drawEllipse(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    const context = this.ctx;
    context.strokeStyle = strokeStyle;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    context.beginPath();
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
  }

  drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    const context = this.ctx;
    context.strokeStyle = strokeStyle;
    context.beginPath();

    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }

  drawArrow(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    const context = this.ctx;
    context.strokeStyle = strokeStyle;
    context.fillStyle = strokeStyle;

    // Draw the main line
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();

    // ---- ARROW HEAD ----
    const headLength = 14; // arrowhead size
    const angle = Math.atan2(endY - startY, endX - startX);

    const leftX = endX - headLength * Math.cos(angle - Math.PI / 6);
    const leftY = endY - headLength * Math.sin(angle - Math.PI / 6);

    const rightX = endX - headLength * Math.cos(angle + Math.PI / 6);
    const rightY = endY - headLength * Math.sin(angle + Math.PI / 6);

    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(leftX, leftY);
    context.lineTo(rightX, rightY);
    context.closePath();

    context.fill(); // filled arrowhead
  }

  drawText(
    text: string,
    x: number,
    y: number,
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    const context = this.ctx;
    context.font = "48px serif";
    context.fillText(text, x, y);
  }

  drawPenStroke(
    points: { x: number; y: number }[],
    strokeStyle: CanvasRenderingContext2D["strokeStyle"] = "white"
  ) {
    if (points.length < 2) return;
    const context = this.ctx;
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;

      context.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    // Draw the last segment
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
    context.stroke();
  }

  shapeRenderer: Record<string, (drawing: any) => void> = {
    rectangle: (d) =>
      this.drawRectangle(d.startX, d.startY, d.endX, d.endY, d.color),

    ellipse: (d) =>
      this.drawEllipse(d.startX, d.startY, d.endX, d.endY, d.color),

    line: (d) => this.drawLine(d.startX, d.startY, d.endX, d.endY, d.color),

    arrow: (d) => this.drawArrow(d.startX, d.startY, d.endX, d.endY, d.color),

    pencil: (d) => this.drawPenStroke(d.points ?? [], d.color),
  };

  redraw(
    camera: React.RefObject<{ x: number; y: number; scale: number }>,
    existingShapes: Content[]
  ) {
    const { x, y, scale } = camera.current;
    const context = this.ctx;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context?.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.setTransform(scale, 0, 0, scale, x, y);
    existingShapes.map((shape: Content) => {
      const renderer = this.shapeRenderer[shape.type];
      if (!renderer) {
        console.warn(`No renderer found for shape: ${shape}`);
        return;
      }

      renderer(shape);
    });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export default function createCanvas(canvas: HTMLCanvasElement) {
  return new Canvas(canvas);
}
