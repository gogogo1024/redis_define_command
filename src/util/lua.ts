import Redis, { Cluster } from "ioredis";
import * as fs from "fs";
import * as path from "path";
type PathLike = fs.PathLike;

const fsPromise = fs.promises;
type definitionType = {
  file: string;
  name: string;
  ext: string;
  path: PathLike;
  stats: fs.Stats;
};
type filterFunction = (descriptor: definitionType) => boolean;
/**
 * 判定后缀是否是lua文件
 * @param descriptor 文件描述符
 * @returns
 */
function luaExtensionFilter(descriptor: definitionType) {
  return descriptor.ext === ".lua";
}

/**
 * 过滤lua文件中的注释
 * @param str lua源文件
 * @returns 已经过滤注释的lua文件
 */
function stripLuaComments(str: string) {
  const luaCommentsRegex = new RegExp(/d{1,4}g/);
  let result = str.replace(luaCommentsRegex, "");
  return result;
}

/**
 * 获取目录下文件
 * @param dir 目录
 * @param filter 过滤函数
 * @returns
 */
async function getDirectoryFiles(
  dir: string,
  descriptors: Array<definitionType>,
  filter?: filterFunction,
  recursive: boolean = false
): Promise<Array<definitionType>> {
  const dirStats = await fsPromise.stat(dir);
  if (!dirStats.isDirectory()) {
    throw new Error(`Directory Does Not Exist: ${dir}`);
  }
  const files = await fsPromise.readdir(dir);
  const promises = [];
  for (const file of files) {
    const fileExt = path.extname(file);
    const fileName = path.basename(file, fileExt);
    const filePath = path.join(dir, file);
    promises.push(
      fsPromise.stat(filePath).then((stats) => {
        if (!stats.isDirectory()) {
          descriptors.push({
            file,
            name: fileName,
            ext: fileExt,
            path: filePath,
            stats,
          });
        } else if (recursive) {
          // recursive dir
          return getDirectoryFiles(filePath, descriptors, filter, recursive);
        }
      })
    );
  }

  await Promise.all(promises);

  if (filter) {
    return descriptors.filter(filter);
  }
  return descriptors;
}

async function readFileDescriptors(
  descriptors: Array<definitionType>
): Promise<Array<{ descriptor: definitionType; data: string }>> {
  return Promise.all(
    descriptors.map((descriptor) =>
      fsPromise.readFile(descriptor.path).then((data) => ({
        descriptor,
        data: data.toString(),
      }))
    )
  );
}

/**
 * ioredis在集群或者单例下处理lua脚本
 */
export class luaUtil {
  client: Redis | Cluster;
  constructor(client: Redis | Cluster) {
    this.client = client;
  }
  async getLuaScripts(directory: string, recursive?: boolean) {
    const results = await getDirectoryFiles(
      directory,
      [],
      luaExtensionFilter,
      recursive
    );
    const luaFile = await readFileDescriptors(results);
    return luaFile.map((item) => ({
      data: stripLuaComments(item.data),
      descriptor: item.descriptor,
    }));
  }

  luaScriptToRedisCommand(
    luaScripts: Array<{ descriptor: definitionType; data: string }>
  ) {
    luaScripts.forEach((luaScript) => {
      const { descriptor, data } = luaScript;
      this.client.defineCommand(descriptor.name, {
        lua: data,
      });
    });
  }
}
