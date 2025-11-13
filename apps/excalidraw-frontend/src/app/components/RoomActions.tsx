"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom } from "../api/rooms";
import { CreateRoomRequest, CreateRoomResponse } from "@/types/rooms";
import { useState } from "react";
import CreateRoomModal from "./CreateRoomModal";
export default function RoomActions() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    isProtected: false,
  });
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation<CreateRoomResponse, Error, CreateRoomRequest>({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
  const handleCreateRoom = () => {
    mutation.mutate(formData);
    setIsCreateRoomModalOpen(false);
    setFormData({ name: "", password: "", isProtected: false });
  };
  const handleRefreshRooms = () => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  };
  return (
    <div>
      <button onClick={handleRefreshRooms}>Refresh Rooms</button>
      <button onClick={() => setIsCreateRoomModalOpen(true)}>
        Create Room
      </button>
      {isCreateRoomModalOpen && (
        <CreateRoomModal
          onClose={() => setIsCreateRoomModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateRoom}
          mutation={mutation}
        />
      )}
    </div>
  );
}
