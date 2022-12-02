console.log("Starting");
import * as path from "path";

import Redis, { Callback, Result } from "ioredis";
import { luaUtil } from "./util/lua";
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
    hashtag(
      number: number,
      key: string[],
      argv: string[],
      callback?: Callback<string>
    ): Result<string, Context>;
  }
}
const cluster = new Redis.Cluster([
  {
    port: 7000,
    host: "127.0.0.1",
  },
  {
    port: 7001,
    host: "127.0.0.1",
  },
  {
    port: 7002,
    host: "127.0.0.1",
  },
  {
    port: 7003,
    host: "127.0.0.1",
  },
  {
    port: 7004,
    host: "127.0.0.1",
  },
  {
    port: 7005,
    host: "127.0.0.1",
  },
]);
const luaUtilInstance = new luaUtil(cluster);
const dirtPath = path.join(process.cwd(), "/src/lua");
(async () => {
  const luaScripts = await luaUtilInstance.getLuaScripts(dirtPath, true);
  luaUtilInstance.luaScriptToRedisCommand(luaScripts);

  const myechoResult = await cluster.myecho(1, "key", "argv");
  console.log("myecho---await", myechoResult);

  cluster.myecho(1, "key1", "argv1", (_, result) => {
    console.log("myecho---then", result);
  });

  cluster.myclear(1, "foo", (_, result) => {
    console.log("myclear---", result);
  });
  // hashtag在集群中的表现
  // 下面两个因为是相同的hashtag {userId},所以是被分配到同一个slot
  // 执行完后可以在redis命令行中查看所在slot
  cluster.hashtag(
    2,
    ["foo{userId}bar", "baz{userId}car"],
    ["fb", "bc"],
    (_, result) => {
      console.log("hashtag---", result);
    }
  );
  cluster.hashtag(
    2,
    ["foouserId1bar", "bazuserId2car"],
    ["fb", "bc"],
    (_, result) => {
      console.log("hashtag---", result);
    }
  );
  // TODO: check
  // 1. 处理相同文件名的lua script
})();
