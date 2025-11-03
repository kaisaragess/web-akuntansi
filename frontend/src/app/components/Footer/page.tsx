import React from "react";

/**
 * 🔹 Footer Component
 *
 * Komponen sederhana untuk menampilkan bagian footer aplikasi.
 * Ditempatkan di bagian bawah setiap halaman seperti Login dan Register.
 */
const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-white text-center py-4">
      {/* Menampilkan tahun berjalan secara otomatis */}
      <p>© {new Date().getFullYear()} Kasku. All rights reserved.</p>
    </footer>
  );
};

export default Footer;