import { Outlet } from "react-router";
import Navbar from "./application/Navbar";


export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <main>
        <Outlet />
      </main>
    </div>
  );
}