"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  hideMenu?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hideMenu = false }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<{
    fullname: string;
    username: string;
    avatar?: string;
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fullname = localStorage.getItem("fullname");
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");
    if (fullname && username) {
      setUser({
        fullname,
        username,
        avatar: avatar || "/prfl.jpg",
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <nav className="bg-stone-900 shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* === Logo === */}
        <div className="text-2xl font-bold text-white">
          <Link href="/">
            Kas<span className="text-green-500">ku:)</span>
          </Link>
        </div>

        {/* === Menu di Tengah (opsional) === */}
        {!hideMenu && (
          <ul className="hidden md:flex space-x-6 text-white text-sm">
            <li>
              <Link href="/" className="hover:text-green-400">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-green-400">About</Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link href="/user/dashboard" className="hover:text-green-400">Dashboard</Link>
              </li>
            )}
          </ul>
        )}

        {/* === Profile Dropdown === */}
        <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
              <span className="text-white text-sm font-semibold hidden md:block">
                {user?.fullname || "User"}
              </span>
              <img
                src={user?.avatar || "/prfl.jpg"}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-green-500 object-cover hover:scale-105 transition"
              />
            </div>
          ) : (
            !isAuthPage && (
              <Link
                href="/auth/login"
                className="text-white text-sm px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition"
              >
                Log in
              </Link>
            )
          )}

          {showDropdown && isLoggedIn && (
            <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-700">{user?.fullname}</p>
                <p className="text-xs text-gray-500">{user?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
