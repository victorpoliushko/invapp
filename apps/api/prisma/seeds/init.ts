import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB...");

  await prisma.user.create({
    data: {
      username: "admin",
      password: "admin",
      email: "admin@email.com",
      role: Role.ADMIN
    }
  });

   console.log("Seeding finished")
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.log(e);
  await prisma.$disconnect();
  process.exit(1);
});
