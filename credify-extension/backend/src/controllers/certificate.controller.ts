import { Request, Response, NextFunction } from "express";
import { certificateService } from "../services/certificate.service";

export const certificateController = {
  mintCertificate: async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { userId, sessionId, walletAddress } = req.body;
      if (!userId || !sessionId || !walletAddress) {
        return res.status(400).json({ success: false, error: "Missing required parameters" });
      }

      const result = await certificateService.mintCertificate(userId, sessionId, walletAddress);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  },

  getUserCertificates: (req: Request, res: Response, next: NextFunction): any => {
    try {
      const userId = req.params.userId as string;
      const certs = certificateService.getUserCertificates(userId);
      return res.json({ success: true, certificates: certs });
    } catch (error) {
      return next(error);
    }
  }
};
