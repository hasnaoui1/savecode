import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useContext } from "react";
import { UserContext } from "../services/UserContext";
import Navbar2 from "../components/Navbar2";

export default function Layout() {
  const { token} = useContext(UserContext);

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col">
      {token ? <Navbar /> : <Navbar2 />}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer className="mt-8 text-center text-sm opacity-70">
        © CopyRights
      </footer>
    </div>
  );
}
