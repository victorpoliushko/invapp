import * as dotenv from 'dotenv';

dotenv.config();

console.log(`${process.env.JWT_SECRET}`)

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback-secret',
};
