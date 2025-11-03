"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Cek token saat komponen dimuat di client
    const token = localStorage.getItem("token");

    if (!token) {
      // Jika tidak ada token, paksa kembali ke login
      console.log("AuthGuard: Tidak ada token, mengarahkan ke login...");
      router.push("/auth/login");
    } else {
      // Jika ada token, izinkan komponen anak (halaman) untuk render
      setIsAuthChecked(true);
    }
  }, [router]); // Hanya jalankan sekali saat mount

  // Tampilkan loading atau null selagi pengecekan
  if (!isAuthChecked) {
    // Anda bisa ganti ini dengan komponen loading spinner
    return null; 
  }

  // Jika pengecekan lolos (token ada), tampilkan halaman
  return <>{children}</>;
};

export default AuthGuard;