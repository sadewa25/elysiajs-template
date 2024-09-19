import { PrismaClient } from "@prisma/client";
import { UserCreateProps } from "../model/UserModel"; // Add this import
import { strings } from "../utils/strings";

const prisma = new PrismaClient();

export const UserController = {
  addUser: async ({ body }: { body: UserCreateProps }) => {
    try {
      const hashPassword = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 12,
      });

      const baseDir = "storage/";
      const f = await body.file_avatar.text();

      const newFileName = `${baseDir}${crypto.randomUUID()}.png`;
      await Bun.write(newFileName, body.file_avatar);

      const user = await prisma.user.create({
        data: {
          ...body,
          password: hashPassword,
          file_avatar: newFileName,
        },
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
