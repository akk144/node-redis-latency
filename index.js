const redis = require('redis');
const _ = require('lodash');


module.exports = (({host,port,password,options,client,latency_interval}) => {
  let _buffer = {};  
  host = host || '127.0.0.1';
  port = port || 6379;
  options = options || {};
  let REDIS_INTERVAL = latency_interval || 1;
  let redisConfig = {host,port,options};
  if(password) _.extend(redisConfig,{password});
  client = client || redis.createClient(redisConfig);

  const hget = (hash, key, callback) => {
    if (_.get(_buffer, [hash, key])) {
      return _buffer[hash][key].push(callback);
    }
    _.set(_buffer, [hash, key], [callback]);
  }
  const execute = (buffer) => (key, err, value) =>
    _.forEach(buffer[key], callback => callback(err, value))

  setInterval(() => {
    if (_.isEmpty(_buffer)) {
      return;
    }
    const hashes = _.keys(_buffer);
    _.forEach(hashes, hash => {
      const buffer = _buffer[hash];
      const keys = _.keys(buffer);
      const runCallbacks = execute(buffer);
      client.hmget(hash, keys, (err, values) => {
        _.forEach(keys, (key, index) => {
          const value = _.get(values, [index]);
          runCallbacks(key, err, value);
        });
      });
    });
    _buffer = {};
  }, REDIS_INTERVAL);

  return _.extend(
    {}, 
    client,
    { hget }
  );
});