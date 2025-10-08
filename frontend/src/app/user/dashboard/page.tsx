"use client"

import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar/page";
import Navbar from "@/app/components/Navbar/page";

const Dashboard = () => {
  return (
    <>
      <div className="flex">
        <Sidebar /> 
        <main className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          <h1 className="text-2xl font-bold mb-6 bg-lime-200 p-3 flex items-center justify-center">
            Dashboard
          </h1>
          <div className="grid grid-cols-3 items-start gap-5 font-bold text-xl">
            <h1 className="bg-lime-50 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">TOTAL DEBIT  <br /> <span className="px-4 py-1 bg-amber-300 rounded-xl"> Rp. 1.000.000,00 </span></h1>
            <h1 className="bg-lime-200 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">TOTAL KREDIT  <br /> <span className="px-4 py-1 bg-amber-300 rounded-xl"> Rp. 1.000.000,00 </span></h1>
            <h1 className="bg-lime-300 p-10 rounded-2xl border border-gray-300 shadow-xl text-center">SALDO  <br /> <span className="px-4 py-1 bg-amber-300 rounded-xl">Rp. 5.000.000,00</span></h1>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
