import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_login_Req } from '../expressjs-aa/api/POST_login';
import { AuthResponse } from '../ts-schema/AuthResponse'

export function implement_POST_login(engine: ExpressAA) {
  engine.implement({
    endpoint: 'POST /login',
    async fn(param: POST_login_Req): Promise<AuthResponse> {
      // login dengan username
      return {} as any;
    }
  });
}
