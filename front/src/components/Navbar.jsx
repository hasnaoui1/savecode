import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../services/UserContext";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/search/${encodeURIComponent(trimmed)}`);
      setSearchTerm(""); // optional: clear input
    }
  };

  return (
    <nav id="navbar" className="flex items-center justify-between bg-[#1e1e1e] px-6 py-4">
      <NavLink to="/">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6" />
          <span className="text-white text-lg font-semibold">SaveCode</span>
        </div>
      </NavLink>

      <form
        onSubmit={handleSearch}
        className="flex items-center bg-[#2a2a2a] px-3 py-1 rounded-md border border-[#333]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 15z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search SaveCode"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-sm text-gray-300 px-2 w-64"
        />
        <button type="submit" className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </form>

      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        <NavLink
          to="/create"
          className="text-gray-300 hover:text-white text-sm"
        >
          Create
        </NavLink>
        <NavLink to="/posts" className="text-gray-300 hover:text-white text-sm">
          My Posts
        </NavLink>

        {/* Avatar and Dropdown */}
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {user?.username?.[0] || "?"}
          </div>

          {/* Dropdown menu */}
          <div
            className={`absolute top-10 right-0 w-44 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-lg z-50 transition-all duration-200 ${
              dropdownOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <NavLink
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
              onClick={() => setDropdownOpen(false)}
            >
              Profile
            </NavLink>
            <hr className="border-gray-700" />
            <NavLink
              to="/settings"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
              onClick={() => setDropdownOpen(false)}
            >
              Settings
            </NavLink>
            <hr className="border-gray-700" />
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a2a]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
