import Redis from "ioredis"; // Redis client

function _parseRedisConnectionString(connectionString?: string) {
  try {
    const connection = (connectionString || "").trim();
    if (connection) {
      const [hostPort, ...params] = connection.split(",");
      const [host, portStr] = hostPort.split(":");

      const paramMap = new Map<string, string>();
      for (const param of params) {
        const [key, ...valueParts] = param.split("=");
        paramMap.set(key, valueParts.join("=")); // Rejoin in case the value contains '='
      }

      return {
        host,
        port: Number(portStr),
        password: paramMap.get("password") || "",
      };
    }
  } catch (err) {}
  return null;
}

export const redisConfig = _parseRedisConnectionString(
  // @ts-ignore
  process.env.KV_REDIS_01_PRIMARY,
);

export function getRedisConnection() {
  if (!redisConfig) {
    return null;
  }

  // Initialize Redis client using environment variable
  const redis = new Redis({
    host: redisConfig["host"],
    port: redisConfig["port"],
    password: redisConfig["password"],
    tls: {},
  });

  return redis;
}
