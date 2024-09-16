import { PrismaClient } from "@prisma/client";
import { strings } from "../utils/strings";
import { UserCreateProps } from "../model/UserModel"; // Add this import

const prisma = new PrismaClient();

export const UserController = {
  addUser: async ({ body }: { body: UserCreateProps }) => {
    try {
      const user = await prisma.user.create({
        data: body,
      });
      return {
        data: user,
        message: strings.response.success,
      };
    } catch (error) {
      console.log("🚀 ~ addUser: ~ error:", error);
      return {
        data: [],
        message: strings.response.failed,
      };
    }
  },
  getUser: async () => {
    try {
      const user = await prisma.user.findMany({});
      return {
        data: user,
        message: strings.response.success,
      };
    } catch (error) {
      console.log("🚀 ~ getUser: ~ error:", error);
      return {
        data: [],
        message: strings.response.failed,
      };
    }
  },
};
