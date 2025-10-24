"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard" },
    { name: "COA", path: "/user/coa" },
    { name: "Transaksi", path: "/user/transaction" },
    { name: "Jurnal Umum", path: "/user/journals" },
    { name: "Buku Besar", path: "/user/ledger" },
    { name: "Neraca Saldo", path: "/user/balance_sheet" },
    {
      name: "Laporan Keuangan",
      children: [
        { name: "Laporan Laba Rugi", path: "/user/report/lostprofitreport" },
        { name: "Laporan Neraca", path: "/user/laporan/neraca" },
        { name: "Arus Kas", path: "/user/report/aruskas" },
      ],
    }
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside className="bg-stone-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 text-center text-xl font-bold border-b border-green-700">
        Kas<span className="text-green-500">ku.)</span>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) =>
          item.children ? (
            <div key={item.name}>
              <button
                onClick={() => toggleDropdown(item.name)}
                className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-green-800 transition ${
                  openDropdown === item.name ? "bg-green-800" : ""
                }`}
              >
                {item.name}
                <span>{openDropdown === item.name ? "▲" : "▼"}</span>
              </button>

              {openDropdown === item.name && (
                <div className="pl-6 bg-green-900">
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => router.push(child.path)}
                      className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 transition ${
                        pathname === child.path ? "bg-green-700" : ""
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-stone-400 transition ${
                pathname === item.path ? "bg-green-800" : ""
              }`}
            >
              {item.name}
            </button>
          )
        )}

        {/* Logout di bawah Laporan Keuangan */}
        <div className="mt-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-left bg-red-500 hover:bg-red-600 transition"
          >
            Keluar
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
