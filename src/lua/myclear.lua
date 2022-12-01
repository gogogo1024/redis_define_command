-- comment for future test
return redis.call('EXISTS', KEYS[1])

-- in bash use redis-cli
-- EVAL "return redis.call('EXISTS',KEYS[1])" 1 foo

