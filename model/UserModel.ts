import { t } from "elysia";

export const UserCreateModels = t.Object({
  name: t.String({ maxLength: 250, default: "" }),
  email: t.String({ format: "email", default: "sampel@tes.id" }),
  password: t.String({ default: "12345" }),
  file_avatar: t.File({
    type: "image/png",
  }),
});

export interface UserCreateProps {
  name: string;
  email: string;
  password: string;
  file_avatar: File;
}
