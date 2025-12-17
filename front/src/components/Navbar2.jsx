import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar2 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchTerm(""); // optional: clear input after navigating
    }
  };

  return (
    <nav  className="flex items-center justify-between bg-[#1e1e1e] px-6 py-4">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="w-6 h-6" />
        <span className="text-white text-lg font-semibold">SaveCode</span>
      </div>

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

      <div className="flex items-center space-x-6">
        <NavLink
          to="/signin"
          className="text-gray-300 hover:text-white text-sm"
        >
          Login
        </NavLink>

        <NavLink
          to="/signup"
          className="text-gray-300 hover:text-white text-sm"
        >
          Sign Up
        </NavLink>

        <img
          className="w-8 h-8 rounded-full bg-black-900 flex items-center justify-center font-bold"
          src="use.png"
          alt="User Avatar"
        />
      </div>
    </nav>
  );
};

export default Navbar2;
