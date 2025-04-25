import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // very secure way to create an admin
  const adminHashedPassword = await bcrypt.hash("admin", 10);
  const editorHashedPassword = await bcrypt.hash("editor", 10);
  const userHashedPassword = await bcrypt.hash("user", 10);

  console.log("Seeding DB...");

  await Promise.all([
    await prisma.user.create({
      data: {
        username: "admin",
        password: adminHashedPassword,
        email: "admin@email.com",
        role: Role.ADMIN
      }
    }),
    await prisma.user.create({
      data: {
        username: "edtior",
        password: editorHashedPassword,
        email: "editor@email.com",
        role: Role.EDITOR
      }
    }),
    await prisma.user.create({
      data: {
        username: "user",
        password: userHashedPassword,
        email: "user@email.com",
        role: Role.USER
      }
    })
  ]);

  console.log("Seeding finished")
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.log(e);
  await prisma.$disconnect();
  process.exit(1);
});
