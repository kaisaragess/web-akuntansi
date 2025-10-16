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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    router.push("/user/home");
  };

  return (
    <>
      <nav className="bg-stone-900 shadow-md fixed w-full top-0 left-0 z-40">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Kas<span className="text-green-500">ku:)</span>
          </div>

          {/* Jika hideMenu = false → tampilkan Home dan About */}
          {!hideMenu && (
            <ul className="flex space-x-4 text-white text-right">
              <li>
                <Link href="/" className="hover:text-green-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/user/order" className="hover:text-green-500">
                  About
                </Link>
              </li>
            </ul>
          )}

          <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
            {/* Jika user login dan sedang di dashboard (hideMenu = true) */}
            {isLoggedIn && hideMenu && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 focus:outline-none"
                >
                  K
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Jika belum login */}
            {!isLoggedIn && (
              <Link
                href="/auth/login"
                className="text-white text-sm px-3 py-1 bg-green-500 rounded-lg hover:bg-green-700"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Modal Profile */}
      {showProfileModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-center text-stone-900">My Profile</h2>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
                U
              </div>
              <p className="text-gray-700 font-semibold">Nama: {}</p>
              <p className="text-gray-700">Username: </p>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-5 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-stone-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
