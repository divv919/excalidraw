import AvailableRooms from "@/app/components/AvailableRooms";
import RoomActions from "@/app/components/RoomActions";

export default function RoomsPage() {
  return (
    <div>
      <h1>RoomsPage</h1>
      <RoomActions />
      <div>
        <h2>Rooms</h2>
        <div>
          <AvailableRooms />
        </div>
      </div>
    </div>
  );
}
