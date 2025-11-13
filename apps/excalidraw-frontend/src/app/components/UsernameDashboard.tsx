"use client";

import { useAuth } from "../hooks/useAuth";
export default function UsernameDashboard() {
  const { user } = useAuth();
  return <div>Username : {user?.username}</div>;
}
