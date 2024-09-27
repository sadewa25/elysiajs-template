import { t } from "elysia";

export const UserCreateModels = t.Object({
  name: t.String({ maxLength: 250, default: "" }),
  email: t.String({ format: "email", default: "sampel@tes.id" }),
  password: t.String({ default: "12345", minLength: 8 }),
  file_avatar: t.File({
    type: "image/png",
  }),
});

export const UserLoginModels = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export interface UserCreateProps {
  name: string;
  email: string;
  password: string;
  file_avatar: File;
}

export interface UserLoginProps {
  email: string;
  password: string;
}

export interface UserResponseByIdProps {
  id: string;
  email: string;
  password: string;
}
