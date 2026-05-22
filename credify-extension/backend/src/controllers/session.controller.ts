import { Request, Response, NextFunction } from "express";
import { sessionService } from "../services/session.service";
import { scoringService } from "../services/scoring.service";

export const sessionController = {
  ingestSession: (req: Request, res: Response, next: NextFunction): any => {
    try {
      const session = req.body;
      if (!session || !session.userId || !session.id) {
        return res.status(400).json({ success: false, error: "Invalid session data" });
      }
      
      sessionService.addSession(session);
      const score = scoringService.calculateCredibilityScore(session);
      
      return res.json({ success: true, score });
    } catch (error) {
      return next(error);
    }
  },

  getUserSessions: (req: Request, res: Response, next: NextFunction): any => {
    try {
      const userId = req.params.userId as string;
      const sessions = sessionService.getSessions(userId);
      return res.json({ success: true, sessions });
    } catch (error) {
      return next(error);
    }
  },

  getSessionScore: (req: Request, res: Response, next: NextFunction): any => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = sessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      const score = scoringService.calculateCredibilityScore(session);
      return res.json({ success: true, score });
    } catch (error) {
      return next(error);
    }
  },

  checkEligibility: (req: Request, res: Response, next: NextFunction): any => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = sessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      const result = scoringService.checkEligibility(session);
      return res.json({ success: true, result });
    } catch (error) {
      return next(error);
    }
  }
};
