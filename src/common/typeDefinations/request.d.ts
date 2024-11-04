import { IAdmin, IUser } from '../interfaces';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      admin: IAdmin;
    }
  }
}

declare module 'express-serve-static-core' {
  export interface Request {
    user?: IUser;
  }
}
