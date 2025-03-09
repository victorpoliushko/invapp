// import { pbkdf2Sync } from 'crypto';
// import { getRandomString } from '../helpers/generateString';
// import { PrismaClient } from '@prisma/client';

// export interface ApiKeyResponse {
//   apiKey: string;
// }

// export class ApiKeyService {
//   private prisma: PrismaClient;

//   public constructor(private readonly prismaClient: PrismaClient) {
//     this.prisma = prismaClient;
//   }

//   async create({ userId }: { userId: string }): Promise<ApiKeyResponse> {
//     const apiKey = this.generateApiKey();
//     const hashedKey = this.hashApiKey(apiKey);
//     await this.prisma.apiKey.deleteMany({ where: { userId } });

//     await this.prisma.apiKey.create({
//       data: {
//         hashedKey,
//         userId
//       }
//     });

//     return { apiKey };
//   }

//   private hashApiKey(key: string): string {
//     const algorithm = 'sha256';
//     const iterations = 100000;
//     const keyLength = 64;
//     return pbkdf2Sync(key, '', iterations, keyLength, algorithm).toString(
//       'hex',
//     );
//   }

//   private generateApiKey() {
//     // option 1
//     // return getRandomString(32).split('').reduce((acc, char, index) => {
//     //   const chunkIndex = Math.floor(index / 4);
//     //   acc[chunkIndex] = (acc[chunkIndex] || '') + char;
//     //   return acc;
//     // }, []).join('-');

//     // option 2
//     const randomStr = getRandomString(32);
//     const chunks: string[] = [];

//     for (let i = 0; i < randomStr.length; i++) {
//       chunks.push(randomStr.slice(i, i + 4));
//     }

//     return chunks.join('-');
//   }
// }
