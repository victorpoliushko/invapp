import { getRandomString } from "../../helpers/generateString";



export class ApiKeyService {

  async create({ userId }: { userId: string }): Promise<ApiKeyResponce> {

  }

  private generateApiKey() {
    // option 1
    // return getRandomString(32).split('').reduce((acc, char, index) => {
    //   const chunkIndex = Math.floor(index / 4);
    //   acc[chunkIndex] = (acc[chunkIndex] || '') + char;
    //   return acc;
    // }, []).join('-');


    // option 2
    const randomStr = getRandomString(32);
    const chunks: string[] = [];

    for (let i = 0; i < randomStr.length; i++) {
      chunks.push(randomStr.slice(i, i + 4));
    }

    return chunks.join('-');
  }
}