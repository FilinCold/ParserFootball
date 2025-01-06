import dotenv from "dotenv";
// доступ к env переменным
dotenv.config();

export const ENV = {
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
};
