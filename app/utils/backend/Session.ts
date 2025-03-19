import { createSessionStorage } from "react-router"; // or cloudflare/deno
import { getRedisConnection, redisConfig } from "~/utils/backend/Redis";
import { getAlphanumericString } from "~/utils/backend/Utils";

type SessionStorageOptions = {
  cookie: {
    name: string;
    httpOnly: boolean;
    expires: Date;
  };
};

type SessionData = {
  [key: string]: any;
};

function _getNewSessionId() {
  const sessionId = `${Date.now().toString()}-${getAlphanumericString()}`;
  return sessionId;
}

function createInMemorySessionStorage({ cookie }: SessionStorageOptions) {
  // Configure your database client...
  let _data: Record<string, SessionData> = {};

  return createSessionStorage({
    cookie,
    async createData(data: SessionData, expires?: Date): Promise<string> {
      const id = _getNewSessionId();
      _data[id] = data;
      return id;
    },
    async readData(id: string): Promise<SessionData | null> {
      return _data[id] || null;
    },
    async updateData(
      id: string,
      data: SessionData,
      expires?: Date,
    ): Promise<void> {
      _data[id] = data;
    },
    async deleteData(id: string): Promise<void> {
      delete _data[id];
    },
  });
}

function createRedisSessionStorage({ cookie }: SessionStorageOptions) {
  // Initialize Redis client using environment variable
  const redis = getRedisConnection();

  return createSessionStorage({
    cookie,
    async createData(data: SessionData, expires?: Date): Promise<string> {
      const sessionId = _getNewSessionId();

      // Calculate expiration time based on the 'expires' date (convert to seconds)
      const expireTime = expires ? Math.floor(expires.getTime() / 1000) : 0;

      // Store data in Redis with the session ID as the key
      await redis?.set(sessionId, JSON.stringify(data), "EX", expireTime);
      return sessionId;
    },
    async readData(id: string): Promise<SessionData | null> {
      const data = await redis?.get(id);
      return data ? JSON.parse(data) : null;
    },
    async updateData(
      id: string,
      data: SessionData,
      expires?: Date,
    ): Promise<void> {
      const expireTime = expires ? Math.floor(expires.getTime() / 1000) : 0;
      await redis?.set(id, JSON.stringify(data), "EX", expireTime);
    },
    async deleteData(id: string): Promise<void> {
      await redis?.del(id);
    },
  });
}

const cookieConfigs = {
  cookie: {
    name: "__session",
    httpOnly: true,
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
  },
};

const { getSession, commitSession, destroySession } = redisConfig
  ? createRedisSessionStorage(cookieConfigs)
  : createInMemorySessionStorage(cookieConfigs);

/**
 * const session = await getSession(request.headers.get("Cookie"));
 * session.get("me")
 * session.get("access_token")
 */
export { commitSession, destroySession, getSession };
