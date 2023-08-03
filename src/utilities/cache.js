const cache = require("memory-cache");
const CACHE_TYPE = "cache";
const CACHE_PORT = 6379;
const CACHE_DUR = 1800;

let getCache, setCache, deleteCache, hashSet, hashGetAll;

getCache = async (KEY) => {
  return await cache.get(KEY);
};

// Setting the data to CACHE server
setCache = (KEY, cache_dur, cacheData) => {
  cache.put(KEY, cacheData, cache_dur ? cache_dur : CACHE_DUR);
};

hashSet = (KEY, cacheData) => {
  cache.put(KEY, JSON.stringify(cacheData));
};

hashGetAll = async (KEY) => {
  const values = await cache.get(KEY);
  return JSON.parse(values);
};

deleteCache = async (KEY) => {
  const cachedDataExists = await cache.get(KEY);
  if (cachedDataExists) {
    cache.del(KEY);
  }
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  hashSet,
  hashGetAll,
};
