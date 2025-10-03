import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_register_Req } from '../expressjs-aa/api/POST_register';
import { AuthResponse } from '../ts-schema/AuthResponse'

export function implement_POST_register(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /register',
    async fn(param: POST_register_Req): Promise<AuthResponse> {
      // register user dengan  username,  password
      return {} as any;
    }
  });
}
