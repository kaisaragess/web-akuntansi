"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// Import 'useRouter' dan tambahkan 'usePathname'
import { useRouter, usePathname } from "next/navigation"; 

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  // Panggil hook usePathname
  const pathname = usePathname(); 

  useEffect(() => {
    // Cek apakah user sudah login dari localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    // Arahkan ke halaman utama user setelah logout
    router.push("/user/home"); 
  };

  // Tentukan apakah kita berada di halaman Auth (Login atau Register)
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <nav className="bg-gray-900 shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-white">
          <Link href="/">
            Kas<span className="text-lime-500 ">ku:)</span>
          </Link>
        </div>
        
        {/* Nav Links dan Tombol Login/Logout */}
        <ul className="flex space-x-3 items-center text-white">
          <li>
            <Link href="/" className="text-sm hover:text-lime-500">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/user/order"
              className="text-sm mx-2 hover:text-lime-500"
            >
              About
            </Link>
          </li>

          {/* Kondisi untuk menampilkan Tombol Login/Logout */}
          {isLoggedIn ? (
            // Jika sudah login, tampilkan tombol Logout
            <li>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1 text-white transition duration-200 rounded-lg bg-red-700 hover:bg-red-600 font-semibold"
              >
                Logout
              </button>
            </li>
          ) : (
            // Jika belum login, tampilkan tombol Login HANYA jika TIDAK berada di halaman Auth
            !isAuthPage && (
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm px-4 py-2 text-white transition duration-200 rounded-lg bg-lime-600 hover:bg-lime-800 font-semibold"
                >
                  Log in
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;