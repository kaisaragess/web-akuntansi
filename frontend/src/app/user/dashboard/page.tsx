"use client"

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar/page";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { 
    const handleResize = () => { 
      if (typeof window !== 'undefined' && window.innerWidth >= 768) { 
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
  
    if (typeof window !== 'undefined') {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <>
      <div className="flex min-h-screen">

        {/* Tombol Hamburger (Terlihat hanya di bawah md:) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        >
          ☰
        </button>
        
        {/* Sidebar Mobile (Terlihat jika isSidebarOpen true DAN di bawah md:) */}
        {isSidebarOpen && typeof window !== 'undefined' && window.innerWidth && (
          <Sidebar 
            onClose={() => setIsSidebarOpen(false)} 
            className="fixed inset-y-0 left-0 z-40 md:hidden"
          />
        )} 

        <main className="flex-1 container mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md text-black overflow-y-auto">
          {/* ... Konten Dashboard lainnya ... */}
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-lime-200 p-2 md:p-3 flex items-center justify-center rounded-md">
            Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-4 md:gap-5">

            {/* Kartu 1: Total Debit */}
            <div className="bg-lime-50 p-6 md:p-8 lg:p-10 rounded-2xl border border-gray-300 shadow-xl text-center flex flex-col justify-between h-full">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl mb-2">TOTAL DEBIT</h2>
              <span className="px-3 py-1 bg-amber-300 rounded-xl text-lg md:text-xl lg:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                Rp. 1.000.000,00
              </span>
            </div>

            {/* Kartu 2: Total Kredit */}
            <div className="bg-lime-200 p-6 md:p-8 lg:p-10 rounded-2xl border border-gray-300 shadow-xl text-center flex flex-col justify-between h-full">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl mb-2">TOTAL KREDIT</h2>
              <span className="px-3 py-1 bg-amber-300 rounded-xl text-lg md:text-xl lg:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                Rp. 1.000.000,00
              </span>
            </div>

            {/* Kartu 3: Saldo */}
            <div className="bg-lime-300 p-6 md:p-8 lg:p-10 rounded-2xl border border-gray-300 shadow-xl text-center flex flex-col justify-between h-full">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl mb-2">SALDO</h2>
              <span className="px-3 py-1 bg-amber-300 rounded-xl text-lg md:text-xl lg:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                Rp. 5.000.000,00
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
