import Sidebar from "../components/Sidebar";
import UsernameDashboard from "../components/UsernameDashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>Dashboard</h1>
      <UsernameDashboard />
      <Sidebar />
      {children}
    </div>
  );
}
