import { BACKEND_BASE_URL } from "@/config/variables";
import { CreateRoomRequest, CreateRoomResponse, Room } from "@/types/rooms";

export const fetchJSON = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const response = await fetch(`${BACKEND_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json() as Promise<T>;
};

export const getRooms = async (): Promise<Room[]> => {
  return fetchJSON<Room[]>("/api/rooms", {
    method: "GET",
  });
};

export const createRoom = async (
  room: CreateRoomRequest
): Promise<CreateRoomResponse> => {
  return fetchJSON<CreateRoomResponse>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(room),
  });
};
