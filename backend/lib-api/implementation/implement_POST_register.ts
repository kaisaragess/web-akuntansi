import { DataSource } from "typeorm";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_register_Req } from '../expressjs-aa/api/POST_register';
import { User } from "../model/table/User";
import { AuthResponse } from '../ts-schema/AuthResponse';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function implement_POST_register(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /register',
    async fn(param: POST_register_Req): Promise<AuthResponse> {
     const { username, password, fullname, role } = param.body;

      // cek apakah username sudah dipakai
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return Promise.reject({
          status: 400,
          message: "Username sudah dipakai",
        });
      }

      // Asumsi JWT_SECRET didefinisikan di suatu tempat (misalnya dari process.env)
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#'; 

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // buat user baru
      const newUser = User.create({
        username,
        password: hashedPassword,
        fullname,
        role,
        created_at: new Date(),
      }); 

      await User.save(newUser);

      const jwtToken = jwt.sign(
        {id: newUser.id, username: newUser.username},
        JWT_SECRET,
        {expiresIn: '1d'}
      )

      return {
        token: jwtToken,
        user: newUser
      };
    },
  });
}

