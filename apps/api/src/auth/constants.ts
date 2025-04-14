import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback-secret',
  expireIn: process.env.JWT_EXPIRE_IN || '1h'
};
