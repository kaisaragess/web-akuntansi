import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { POST_register_Req } from '../expressjs-aa/api/POST_register'; // Import tipe request untuk endpoint POST /register
import { UserType } from "../model/enum/UserType"; // Import enum UserType untuk role user
import { User } from "../model/table/User"; // Import model User dari database
import bcrypt from 'bcrypt'; // Import bcrypt untuk hashing password

export function implement_POST_register(engine: ExpressAA) {
  // Fungsi untuk implementasi endpoint POST /register
  engine.implement({
    endpoint: 'POST /register', // Menentukan route endpoint
    async fn(param: POST_register_Req): Promise<boolean> { // Fungsi handler untuk endpoint, mengembalikan boolean
      // Ambil fullname, username, password dari request body
      const { fullname, username, password } = param.body;
      
      if (!fullname || !username || !password) { // Validasi input wajib
        throw new Error("fullname, username, password are required"); // Lempar error jika ada field kosong
      }

      const existingUser = await User.findOneBy({ username }); // Cek apakah username sudah ada di database
      if (existingUser) { // Jika username sudah digunakan
        throw new Error("username already exists"); // Lempar error
      }

      if (password.length < 6) { // Validasi panjang password minimal 6 karakter
        throw new Error("password must be at least 6 characters long"); // Lempar error
      }

      if (username.length < 4) { // Validasi panjang username minimal 4 karakter
        throw new Error("username must be at least 4 characters long"); // Lempar error
      }

      if (fullname.length < 4) { // Validasi panjang fullname minimal 4 karakter
        throw new Error("fullname must be at least 4 characters long"); // Lempar error
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash password dengan bcrypt, salt 10

      const newUser = new User(); // Buat instance User baru
      newUser.fullname = fullname; // Set fullname
      newUser.username = username; // Set username
      newUser.password = hashedPassword; // Set password yang sudah di-hash
      newUser.role = UserType.user; // Set role default sebagai user
      newUser.created_at = new Date(Date.now()); // Set tanggal pembuatan sekarang

      await newUser.save(); // Simpan user baru ke database
      return true; // Kembalikan true jika registrasi berhasil
    }
  });
}