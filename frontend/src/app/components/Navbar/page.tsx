"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User } from "../../../../axios-client/ts-model/table/User";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fullname = localStorage.getItem("fullname");
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar"); // optional: avatar URL
    if (fullname && username) {
      setUser({ fullname, username, avatar: avatar || "/default-avatar.png" });
    }
  }, []);

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
    localStorage.removeItem("fullname");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    setIsLoggedIn(false);
    router.push("/user/home");
  };

  const hideLoginButton =
    pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <>
      <nav className="bg-stone-900 shadow-md fixed w-full top-0 left-0 z-40">
        <div className="container mx-auto px-6 py-3 flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Kas<span className="text-green-500">ku:)</span>
          </div>

          {/* Home & About di sebelah kanan */}
          {!hideMenu && (
            <ul className="flex space-x-4 text-white ml-auto">
              <li>
                <Link href="/" className="hover:text-green-500">
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById("about");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="hover:text-green-500"
                >
                  About
                </button>
              </li>
            </ul>
          )}

          <div
            className="flex items-center space-x-3 relative ml-4"
            ref={dropdownRef}
          >
            {isLoggedIn && hideMenu && (
              <div className="relative flex items-center space-x-2">
                {/* Profile Image */}
                {/* Username di sebelah avatar */}
                <span className="text-white font-semibold">
                  {user?.username || "User"}
                </span>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-green-600 hover:bg-blue-700 focus:outline-none"
                >
                  <img
                    src={"/prfl.jpg"}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-12 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
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

            {!isLoggedIn && !hideLoginButton && (
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
    </>
  );
};

export default Navbar;
