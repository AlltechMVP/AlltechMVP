
import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ role }) {
  return (
    <div className="flex min-h-screen">
      {["recruiter", "admin"].includes(role) && <Sidebar />}
      <div className="flex flex-col flex-1">
        <TopNav />
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
