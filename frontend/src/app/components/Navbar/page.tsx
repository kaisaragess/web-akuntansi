import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah user sudah login dari localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    router.push("/user/home");
  };

  return (
    <nav className="bg-gray-900 shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          Kas<span className="text-green-500 ">ku:)</span>
        </div>
        <ul className="flex space-x-3 text-white">
          <li>
            <Link href="/" className="text-xm hover:text-lime-500">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/user/order"
              className="text-xm mx-2 hover:text-lime-500"
            >
              About
            </Link>
          </li>

          {isLoggedIn ? (
            <li>
              <button
                onClick={handleLogout}
                className="text-xm px-2 py-1  text-white transition duration-200 rounded-lg bg-red-700  hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link
                href="auth\login"
                className="text-xm px-4 py-2  text-white transition duration-200 rounded-lg bg-lime-600  hover:bg-lime-800"
              >
                Log in
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
