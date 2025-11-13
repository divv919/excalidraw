import CanvasComponent from "@/app/(auth)/components/CanvasComponentForWS";
import { BACKEND_BASE_URL } from "@/config/variables";
import axios from "axios";

type Shape = {
  type: "rect" | "circle";
  height: number;
  width: number;
  clientX: number;
  clientY: number;
};
const getPreviousMessages = async (roomId: number) => {
  const response = await axios.get(`${BACKEND_BASE_URL}/chats/${roomId}`);
  return response.data;
};
const CanvasPage = async ({ params }: { params: { roomId: number } }) => {
  const prevMessages = await getPreviousMessages(params.roomId);
  const existingShapes: string[] = prevMessages.messages.map(
    (msg: any) => msg.message
  );
  console.log("existing shapes are direct after fetching : ", existingShapes);
  return (
    <div className="h-screen w-screen bg-neutral-900">
      <CanvasComponent existingShapes={existingShapes} />
    </div>
  );
};
export default CanvasPage;
