import { Role } from "@prisma/client";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
}
