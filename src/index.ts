console.log("Starting");
import * as path from "path";

import Redis, { Callback, Result } from "ioredis";
import { luaUtil } from "./util/lua";
const redis = new Redis();

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

  console.log("myecho", await cluster.myecho(1, "key", "argv"));

  cluster.myecho(1, "key1", "argv1", (_, result) => {
    console.log("callback", result);
  });

  cluster.myclear(1, "foo", (_, result) => {
    console.log("callback", result);
  });
  // TODO
  // 1. hashtag在集群中的表现
  // 2. 单例和集群下的lua命令的不凹陷
})();
