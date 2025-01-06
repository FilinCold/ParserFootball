import dotenv from "dotenv";
// доступ к env переменным
dotenv.config();

export const ENV = {
  KEY: process.env.KEY || "KEYf#kas7",
  MONGO_URI: process.env.MONGO_URI,
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
};
