"use client";

import React from "react";
import Sidebar from "@/app/components/Sidebar/page";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar di kiri */}
      <Sidebar />

      {/* Kontainer utama */}
      <div className="flex-1 flex flex-col text-black">
        {/* Navbar di atas */}
        <Navbar hideMenu />

        {/* Konten utama */}
        <main className="flex-1 p-6 mt-16">
          <h1 className="text-2xl font-bold mb-6 bg-lime-200 p-3 text-center rounded-lg shadow">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-bold text-xl">
            <div className="bg-lime-50 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              TOTAL DEBIT <br />
              <span className="px-4 py-1 bg-amber-300 rounded-xl">
                Rp. 1.000.000,00
              </span>
            </div>

            <div className="bg-lime-200 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              TOTAL KREDIT <br />
              <span className="px-4 py-1 bg-amber-300 rounded-xl">
                Rp. 1.000.000,00
              </span>
            </div>

            <div className="bg-lime-300 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              SALDO <br />
              <span className="px-4 py-1 bg-amber-300 rounded-xl">
                Rp. 5.000.000,00
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
