import { Router } from "express";
import { sessionController } from "../controllers/session.controller";
import { certificateController } from "../controllers/certificate.controller";

export const router = Router();

// Sessions and Scoring
router.post("/sessions", sessionController.ingestSession);
router.get("/sessions/:userId", sessionController.getUserSessions);
router.get("/score/:userId/:sessionId", sessionController.getSessionScore);
router.get("/eligibility/:userId/:sessionId", sessionController.checkEligibility);

// Certificates / Minting
router.post("/certificates/mint", certificateController.mintCertificate);
router.get("/certificates/:userId", certificateController.getUserCertificates);
