redis.call('SET', KEYS[1], ARGV[1])
redis.call('SET', KEYS[2], ARGV[2])
local value1 = redis.call('GET', KEYS[1])
local value2 = redis.call('GET', KEYS[2])

if value1 ~= ARGV[1] then
    return 0
end
if value2 ~= ARGV[2] then
    return 0
end
return 1

-- EVAL "return redis.call('set', KEYS[1], ARGV[1])" 1 foo{userId}bar fb

