
const sessions = new Map<string, any>();

export const getSession = (userId: string) => {
  return sessions.get(userId) || {};
};

export const setSession = (userId: string, data: any) => {
  sessions.set(userId, data);
};

export const clearSession = (userId: string) => {
  sessions.delete(userId);
};