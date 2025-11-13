"use client";
import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../api/rooms";
import { Room } from "@/types/rooms";
export default function AvailableRooms() {
  const { data, isLoading, error } = useQuery<Room[], Error>({
    queryKey: ["rooms"],
    queryFn: getRooms,
    staleTime: 1000 * 60 * 5,
  });
  return (
    <div>
      <h2>Available Rooms</h2>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data &&
        data.map((room) => (
          <div key={room.id}>
            <h3>{room.name}</h3>
          </div>
        ))}
    </div>
  );
}
