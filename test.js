const RedisServer = require('redis-server');
const async = require('async');
const _ = require('lodash');
const redis = require('redis');
const redisClient = require('./index');
 
const PORT = 7000;
const NUM = 5;
const TESTS = {};

TESTS.hgetLatency = ({KEY_NUM, redis}, callback) => {
  const keys = _.times(KEY_NUM, n => `foo${n}`);
  const values = _.times(KEY_NUM, n => `bar${n}`);

  const msetArgs = _
    .chain(keys)
    .zip(values)
    .flatten()
    .value();

  const randomKeyValuePair = _.shuffle(_.zip(keys, values));
  const randomKeys = _.map(randomKeyValuePair, _.first);
  const randomValues = _.map(randomKeyValuePair, _.last);

  async.auto({
    hmset: callback => redis.hmset('collection_condition',msetArgs, callback),
    hget: ['hmset', callback => 
      async.map(randomKeys, (key, next) => setTimeout(() => redis.hget('collection_condition', key, next), _.random(1000, 2000)), callback)
    ]
  }, (err, { hmset, hget }) => {
    if (err) {
      return callback(err);
    }
    if (hmset !== 'OK') {
      return callback('mset was not successful');
    }
    if (!_.isEqual(hget, randomValues)) {
      return callback('Mget response doesn\'t match values');
    }
    return callback();
  });
}

async.times(NUM, (index, next) => {
  const server = new RedisServer(PORT + index);
  server.open(next);
}, (err) => {
  const options = {
    servers: _.map(_.times(NUM, n => `127.0.0.1:${PORT + n}`))
  };

  const REDIS_INTERVAL = 2;
  const _redisConditionClient = redis.createClient({host: '127.0.0.1',port : 6370});

  const _redis_client = redisClient({client : _redisConditionClient,latency_interval : REDIS_INTERVAL});
  const KEY_NUM = 100;

  const args = { KEY_NUM, redis : _redis_client};

  const asyncArgs = _.reduce(
    TESTS,
    (acc, value, key) => {
      acc[key] = _.partial(value, args);
      return acc;
    },
    {}
  );

  async.auto(asyncArgs, (err) => {
    if (err) {
      throw err;
    }
    console.log('Success. All tests passed.');
    process.exit(0);
  });
});