"use client";
import { useRouter } from "next/navigation";
export default function DashboardPage() {
  const router = useRouter();
  return (
    <div>
      DashboardPage
      <button
        onClick={() => {
          router.push("/dashboard/rooms");
        }}
      >
        Collaborate
      </button>
      <button onClick={() => alert("Local mode Not implemented yet")}>
        Local
      </button>
    </div>
  );
}
