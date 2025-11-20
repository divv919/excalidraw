import { Minus, Plus } from "lucide-react";

export default function ZoomIndicator({
  camera,
  MAX_ZOOM,
  MIN_ZOOM,
  zoomLevel,
  setZoomLevel,
}: {
  camera: React.RefObject<{ x: number; y: number; scale: number }>;
  MAX_ZOOM: number;
  MIN_ZOOM: number;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex gap-3 items-center overflow-hidden rounded-md absolute bottom-10 right-10 bg-neutral-800">
      <button
        className="hover:bg-neutral-700 transition-all duration-200 cursor-pointer px-3 py-2"
        onClick={() => {
          const value = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, camera.current.scale + 0.1)
          );
          camera.current.scale = value;
          setZoomLevel(value);
        }}
      >
        <Plus size={16} />
      </button>
      <div>{(zoomLevel * 100).toFixed(0)}%</div>
      <button
        onClick={() => {
          const value = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, camera.current.scale - 0.1)
          );
          camera.current.scale = value;
          setZoomLevel(value);
        }}
        className="px-3 py-2 hover:bg-neutral-700 transition-all duration-200 cursor-pointer"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}
