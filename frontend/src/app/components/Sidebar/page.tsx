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
  Diff
} from "lucide-react";

/**
 * ==========================
 * 🧭 Komponen Sidebar
 * ==========================
 * Komponen ini digunakan untuk menampilkan menu navigasi utama
 * pada bagian kiri aplikasi (sidebar) untuk pengguna yang telah login.
 * 
 * - Menampilkan daftar menu utama (Dashboard, COA, Transaksi, dll.)
 * - Menyediakan submenu dropdown untuk "Laporan Keuangan"
 * - Menyorot menu aktif sesuai halaman yang sedang dibuka
 * - Menyediakan tombol Logout untuk keluar dari sistem
 */

const Sidebar = () => {
  const router = useRouter(); // Hook untuk navigasi antar halaman
  const pathname = usePathname(); // Hook untuk mendapatkan path halaman aktif
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // State untuk mengatur dropdown yang terbuka

  /**
   * 🔒 Fungsi Logout
   * Menghapus token dari localStorage agar sesi pengguna berakhir,
   * kemudian mengarahkan ke halaman login.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  /**
   * 📂 Daftar Menu Utama Sidebar
   * Tiap item berisi:
   *  - name: nama menu
   *  - path: rute halaman
   *  - icon: ikon dari library lucide-react
   *  - children (opsional): submenu yang ditampilkan saat dropdown terbuka
   */
  const menuItems = [
    { name: "Dashboard"   , path: "/user/dashboard"     , icon: LayoutDashboard },
    { name: "COA"         , path: "/user/coa"           , icon: Book },
    { name: "Transaksi"   , path: "/user/transaction"   , icon: ClipboardList },
    { name: "Jurnal Umum" , path: "/user/journals"      , icon: BookOpen },
    { name: "Buku Besar"  , path: "/user/ledger"        , icon: FileText },
    { name: "Neraca Saldo", path: "/user/trial_balance" , icon: BarChart },
    {
      name: "Laporan Keuangan",
      icon: PieChart,
      children: [
        { name: "Laporan Laba Rugi", path: "/user/report/lostprofitreport" , icon: TrendingUp },
        { name: "Perubahan Modal", path: "/user/report/equitychange", icon: Diff },
        { name: "Laporan Neraca", path: "/user/report/balance_sheet", icon: FileText },
        { name: "Arus Kas", path: "/user/report/cashflow" , icon: Book }
      ],
    },
  ];

  /**
   * 📉 toggleDropdown()
   * Fungsi untuk membuka/menutup dropdown submenu.
   * Jika dropdown sudah terbuka, maka diklik lagi akan menutupnya.
   */
  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside className="bg-stone-900 text-white w-64 md:w-64 min-h-screen flex transition-all duration-300 sm:w-20 sm:overflow-x-hidden">
      
      {/* === LOGO SIDEBAR === */}
      <div className="flex items-center justify-center py-4 text-2xl font-bold border-b border-stone-800">
        {/* Logo bisa ditambahkan di sini (misalnya teks atau gambar brand) */}
        <span className="hidden sm:hidden md:inline"></span>
      </div>

      {/* === MENU UTAMA === */}
      <nav className="flex-1">
        {menuItems.map((item) =>
          // Jika menu memiliki submenu (dropdown)
          item.children ? (
            <div key={item.name}>
              {/* === Tombol Utama Dropdown === */}
              <button
                onClick={() => toggleDropdown(item.name)}
                className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-green-800 transition 
                ${openDropdown === item.name ? "bg-green-800" : ""}`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3 hidden sm:hidden md:inline">{item.name}</span>
                </div>
                {/* Ikon panah naik/turun */}
                <div className="hidden sm:hidden md:block">
                  {openDropdown === item.name ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* === Submenu Dropdown === */}
              {openDropdown === item.name && (
                <div className="pl-6 bg-green-900">
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => router.push(child.path)}
                      className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 transition 
                      ${pathname === child.path ? "bg-green-700" : ""}`}
                    >
                      <child.icon className="w-4 h-4" />
                      <span className="ml-2 hidden sm:hidden md:inline">{child.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // === Menu Biasa (Tanpa Submenu) ===
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex items-center w-full px-4 py-3 text-left hover:bg-stone-700 transition 
              ${pathname === item.path ? "bg-green-800" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3 hidden sm:hidden md:inline">{item.name}</span>
            </button>
          )
        )}

        {/* === Tombol Logout === */}
        <div className="mt-2 border-t border-stone-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-left bg-red-600 hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3 hidden sm:hidden md:inline">Keluar</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;