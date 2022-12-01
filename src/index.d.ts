import { Callback, Result } from "ioredis";

declare module "ioredis" {
  interface RedisCommander<Context> {
    myecho(
      number: number,
      key: string,
      argv: string,
      callback?: Callback<string>
    ): Result<string, Context>;
    myclear(
      number: number,
      key: string,
      callback?: Callback<string>
    ): Result<string, Context>;
  }
}
