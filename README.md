# redis_define_command

## 注意事项

1. 使用 lua script 是 redis.call/pcall 的参数只能 KEY[n],或者 ARGV[n] n 为正整数,而不能是通过函数传递的参数
2. lua script 不能执跨 Redis 节点的命令，例如 KEYS、SCAN 等。
3. 在调用 redis command 时需要注意 key 需要落在一个 slot 中，推荐用 hashtag
4. lua script 也不是没有问题的，毕竟还是需要加载到内存中的，而不会持久化，可以参照 redis 7.0 出的 function

### 引用

1. [浅析 redis lua 实现](https://mytechshares.com/2022/10/07/dive-redis-lua/)
2. [redis 7.0 function](https://redis.io/docs/manual/programmability/functions-intro/)
3. [redis 7.0 function issue](https://github.com/redis/redis/issues/8693)
