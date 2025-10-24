"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  FileText,
  ClipboardList,
  BookOpen,
  BarChart,
  PieChart,
  TrendingUp,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "COA", path: "/user/coa", icon: Book },
    { name: "Transaksi", path: "/user/transaction", icon: ClipboardList },
    { name: "Jurnal Umum", path: "/user/journals", icon: BookOpen },
    { name: "Buku Besar", path: "/user/ledger", icon: FileText },
    { name: "Neraca Saldo", path: "/user/trial_balance", icon: BarChart },
    {
      name: "Laporan Keuangan",
      icon: PieChart,
      children: [

        { name: "Laporan Laba Rugi", path: "/user/report/lostprofitreport" , icon: TrendingUp},
        { name: "Laporan Neraca", path: "/user/report/balance_sheet", icon: FileText },
        { name: "Arus Kas", path: "/user/report/cashflow" , icon: Book},
        { name: "Perubahan Modal", path: "/user/report/equitychange" },

      ],
    }
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

return (
  <aside className="bg-stone-900 text-white w-20 md:w-64 min-h-screen flex flex-col transition-all duration-300">

    {/* ====== MENU ====== */}
    <nav className="flex-1 overflow-y-auto">
      {menuItems.map((item) =>
        item.children ? (
          <div key={item.name}>
            <button
              onClick={() => toggleDropdown(item.name)}
              className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-green-800 transition ${
                openDropdown === item.name ? "bg-green-800" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon size={20} />
                <span className="hidden md:inline">{item.name}</span>
              </div>
              <span className="hidden md:inline">
                {openDropdown === item.name ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </button>

            {openDropdown === item.name && (
              <div className="pl-6 bg-green-900 hidden md:block">
                {item.children.map((child) => {
                  const Icon = child.icon as React.ElementType | undefined;
                  return (
                    <button
                      key={child.name}
                      onClick={() => router.push(child.path)}
                      className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 transition ${
                        pathname === child.path ? "bg-green-700" : ""
                      }`}
                    >
                      {Icon && <Icon size={18} className="mr-2" />}
                      <span className="hidden md:inline">{child.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-stone-400 transition ${
              pathname === item.path ? "bg-green-800" : ""
            }`}
          >
            <item.icon size={20} />
            <span className="hidden md:inline">{item.name}</span>
          </button>
        )
      )}

      {/* ====== LOGOUT ====== */}
      <div className="mt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-3 text-left bg-red-500 hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </nav>
  </aside>
);

};

export default Sidebar;
