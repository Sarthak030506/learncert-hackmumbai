export const sessionService = {
  // Simple in-memory store
  sessions: new Map<string, any[]>(),
  sessionsById: new Map<string, any>(),

  addSession: (session: any) => {
    const userSessions = sessionService.sessions.get(session.userId) || [];
    const index = userSessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      userSessions[index] = session;
    } else {
      userSessions.push(session);
    }
    
    sessionService.sessions.set(session.userId, userSessions);
    sessionService.sessionsById.set(session.id, session);
  },

  getSessions: (userId: string) => {
    return sessionService.sessions.get(userId) || [];
  },

  getSession: (sessionId: string) => {
    return sessionService.sessionsById.get(sessionId) || null;
  }
};
