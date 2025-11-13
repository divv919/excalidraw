"use client";

import { CreateRoomRequest, CreateRoomResponse } from "@/types/rooms";
import { UseMutationResult } from "@tanstack/react-query";

export default function CreateRoomModal({
  onClose,
  formData,
  setFormData,
  onSubmit,
  mutation,
}: {
  onClose: () => void;
  formData: { name: string; password: string; isProtected: boolean };
  setFormData: (data: {
    name: string;
    password: string;
    isProtected: boolean;
  }) => void;
  mutation: UseMutationResult<CreateRoomResponse, Error, CreateRoomRequest>;
  onSubmit: () => void;
}) {
  return (
    <div>
      <button disabled={mutation.isPending} onClick={onClose}>
        Close
      </button>
      <h1>Create Room</h1>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        type="text"
        placeholder="Room Name"
        disabled={mutation.isPending}
      />
      <input
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        type="text"
        placeholder="Room Password"
        disabled={mutation.isPending}
      />
      <input
        disabled={mutation.isPending}
        checked={formData.isProtected}
        onChange={(e) =>
          setFormData({ ...formData, isProtected: e.target.checked })
        }
        type="checkbox"
        placeholder="Room Password"
      />
      <button disabled={mutation.isPending} onClick={onSubmit}>
        Create Room
      </button>
    </div>
  );
}
