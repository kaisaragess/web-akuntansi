import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_register_Req } from '../expressjs-aa/api/POST_register';
import { UserType } from "../model/enum/UserType";
import { User } from "../model/table/User";
import bcrypt from 'bcrypt';

export function implement_POST_register(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /register',
    async fn(param: POST_register_Req): Promise<boolean> {
      // register user dengan  username,  password
            const { fullname, username, password } = param.body;
      
      if (!fullname || !username || !password) {
        throw new Error("fullname, username, password are required");
      }

      const existingUser = await User.findOneBy({ username });
      if (existingUser) {
        throw new Error("username already exists");
      }

      if (password.length < 6) {
        throw new Error("password must be at least 6 characters long");
      }

      if (username.length < 4) {
        throw new Error("username must be at least 4 characters long");
      }

      if (fullname.length < 4) {
        throw new Error("fullname must be at least 4 characters long");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.fullname = fullname;
      newUser.username = username;
      newUser.password = hashedPassword;
      newUser.role = UserType.user;
      newUser.created_at = new Date(Date.now());

      await newUser.save();
      return true;
    }
  });
}
