import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { POST_login_Req } from '../expressjs-aa/api/POST_login'; // Import tipe request untuk endpoint POST /login
import { AuthResponse } from '../ts-schema/AuthResponse'; // Import tipe response untuk autentikasi
import { User } from '../model/table/User'; // Import model User dari database
import { Token } from '../model/table/Token'; // Import model Token untuk menyimpan JWT
import jwt from 'jsonwebtoken'; // Import library jsonwebtoken untuk membuat token
import bcrypt from 'bcrypt'; // Import bcrypt untuk validasi password

export function implement_POST_login(engine: ExpressAA) {
  // Fungsi untuk implementasi endpoint POST /login
  engine.implement({
    endpoint: 'POST /login', // Menentukan route endpoint
    async fn(param: POST_login_Req): Promise<AuthResponse> { // Fungsi handler untuk endpoint
      const { username, password } = param.body; // Ambil username dan password dari request body
      
      const foundUser = await User.findOne({ where: {username}}); // Cari user berdasarkan username
      if (!foundUser) { // Jika user tidak ditemukan
        throw new Error("Username atau Password doesn't match"); // Lempar error
      }

      const match = await bcrypt.compare(password, foundUser.password); // Bandingkan password plaintext dengan hash di DB
      if (!match) { // Jika password tidak cocok
        throw new Error("Username atau Password doesn't match"); // Lempar error
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#'; 
      // Ambil secret JWT dari env, jika tidak ada pakai default aman

      const jwtToken = jwt.sign({ 
        id: foundUser.id,
        username: foundUser.username}, 
        JWT_SECRET
        ) // Buat JWT token dengan payload user

      const newToken        = new Token(); // Buat instance Token baru
      newToken.id_user      = foundUser.id; // Set user ID pemilik token
      newToken.token        = jwtToken; // Set token yang baru dibuat
      newToken.expired_at   = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expired 24 jam dari sekarang
      await newToken.save(); // Simpan token ke database

      return {
        token: jwtToken, // Kembalikan JWT token
        user: foundUser, // Kembalikan data user
      };
    }
  });
}