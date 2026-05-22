import "@plasmohq/messaging/background"
import { Storage } from "@plasmohq/storage"
import { STORAGE_KEYS } from "~lib/constants"

const storage = new Storage()

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Credify] Extension installed and background worker active")
})

/**
 * Handle messages from the content scripts (including the Web Bridge)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message
  console.log(`[Background] Received message: ${action}`, payload)

  // Handle various actions
  switch (action) {
    case "GET_SESSION":
      handleGetSession(sendResponse)
      return true // Keep channel open for async response

    case "GET_USER_DATA":
      handleGetUserData(sendResponse)
      return true

    case "SYNC_WALLET":
      handleSyncWallet(payload, sendResponse)
      return true

    default:
      sendResponse({ action: `${action}_RESPONSE`, success: false, error: "Unknown action" })
      break
  }
})

async function handleGetSession(sendResponse: (response: any) => void) {
  const session = await storage.get(STORAGE_KEYS.ACTIVE_SESSION)
  sendResponse({ 
    action: "GET_SESSION_RESPONSE", 
    success: true, 
    payload: session ? JSON.parse(session) : null 
  })
}

async function handleGetUserData(sendResponse: (response: any) => void) {
  const userId = await storage.get(STORAGE_KEYS.USER_ID)
  const walletAddress = await storage.get(STORAGE_KEYS.WALLET_ADDRESS)
  const certificates = await storage.get(STORAGE_KEYS.CERTIFICATES) || []

  sendResponse({
    action: "GET_USER_DATA_RESPONSE",
    success: true,
    payload: { userId, walletAddress, certificates }
  })
}

async function handleSyncWallet(payload: any, sendResponse: (response: any) => void) {
  const { walletAddress, userId } = payload
  if (walletAddress) await storage.set(STORAGE_KEYS.WALLET_ADDRESS, walletAddress)
  if (userId) await storage.set(STORAGE_KEYS.USER_ID, userId)

  sendResponse({
    action: "SYNC_WALLET_RESPONSE",
    success: true
  })
}
