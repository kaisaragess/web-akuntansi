"use client";

import React from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen pt-16 bg-white text-black">
      <Sidebar />
      <Navbar hideMenu />

      {/* Konten utama */}
      <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold mb-6 bg-green-200 p-3 text-center rounded-lg shadow">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold text-xl">
            <div className="bg-green-50 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              TOTAL DEBIT <br />
              <span className="px-4 py-1 bg-yellow-300 rounded-xl">
                Rp. 1.000.000,00
              </span>
            </div>

            <div className="bg-green-200 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              TOTAL KREDIT <br />
              <span className="px-4 py-1 bg-yellow-300 rounded-xl">
                Rp. 1.000.000,00
              </span>
            </div>

            <div className="bg-green-300 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">
              SALDO <br />
              <span className="px-4 py-1 bg-yellow-300 rounded-xl">
                Rp. 5.000.000,00
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
