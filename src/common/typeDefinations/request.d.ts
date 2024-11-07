import { IUser } from "../interfaces";
import { IAdmin } from "../interfaces";

declare module 'express-session' {
  interface SessionData {
    admin?:IAdmin
  }
}

declare module 'express-serve-static-core' {
  export interface Request {
    user?: IUser;
  }
}
