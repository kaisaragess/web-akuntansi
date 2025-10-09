import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_login_Req } from '../expressjs-aa/api/POST_login';
import { AuthResponse } from '../ts-schema/AuthResponse';
import { User } from '../model/table/User';
import { Token } from '../model/table/Token';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export function implement_POST_login(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /login',
    async fn(param: POST_login_Req): Promise<AuthResponse> {
      const { username, password } = param.body;
      
      const foundUser = await User.findOne({ where: {username}});
      if (!foundUser) {
        throw new Error("User not found");
      }

      const match = await bcrypt.compare(password, foundUser.password);
      if (!match) {
        throw new Error("Password doesn't match");
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sangat_aman_dan_panjang_sekali_123!@#';

      const jwtToken = jwt.sign({ 
        id: foundUser.id,
        username: foundUser.username}, 
        JWT_SECRET
        )

      const newToken        = new Token();
      newToken.id_user      = foundUser.id;
      newToken.token        = jwtToken;
      newToken.expired_at   = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await newToken.save();

      return {
        token: jwtToken,
        user: foundUser,
      };
    }
  });
}
