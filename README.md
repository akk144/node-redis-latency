redis-latency
=====================

A  library for providing latency for redis commands in node.

Right now only hget is supported
This project improves over the parent project by consistently distributing mget and mset over the sharded redis instances. (The parent implementation sends mget and mset to a single instance).

    $ npm install node-redis-latency

    Providing redis client
    var redis_latency = require('node-redis-latency');
    var _redisClient = redis.createClient({host: '127.0.0.1',port : 6370});
    var options = { client : _redisClient,latency_interval};
    var redis = redis_latency(options);

    Providing redis credentials
    var redis_latency = require('node-redis-latency');
    var options = { host: '127.0.0.1',port: 6379 , password : 'redisforCGI' };
    var redis = redis_latency(options);

    // SINGLE
    redis.hset('hash','foo','bar', console.log),
    redis.hget('hash','foo', console.log);j

    // SINGLE (Multi key commands)
    redis.hmset(hash,['key1', 'val1', 'key2', 'val2', 'key3', 'val3'], console.log);
    redis.hget(hash,'key1', console.log);


Options
-------

The constructor accepts an object containing the following options:

- `host` - Redis host to connect
- `port` - Redis port to connect
- `password` - Password for authentication
- `options` - Options object to be passed to Redis client
- `client` - passing existing redis client

Tests
-----

To run tests, use

```
npm run tests
```