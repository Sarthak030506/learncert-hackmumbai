import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import type { WatchSession } from "../../types/session"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (!req.body) {
    res.send({ success: false, error: "No payload" })
    return
  }

  try {
    const { session } = req.body as { session: WatchSession }
    if (!session) {
      res.send({ success: false, error: "No session object inside body" })
      return
    }
    
    // Get existing sessions for this user, or create new array
    const key = `sessions_${session.userId}`
    const existing = await storage.get<WatchSession[]>(key) || []
    
    // Update if exists, else push
    const index = existing.findIndex(s => s.id === session.id)
    if (index >= 0) {
      existing[index] = session
    } else {
      existing.push(session)
    }
    
    await storage.set(key, existing)
    
    // Forward to backend if completed
    if (session.isCompleted) {
      console.log("[Credify] Session completed, forwarding to backend", session.id)
      // fetch('http://localhost:3001/api/sessions', { ... })
    }

    res.send({ success: true })
  } catch (err) {
    console.error("[Credify] Error saving session:", err)
    res.send({ success: false, error: String(err) })
  }
}

export default handler
