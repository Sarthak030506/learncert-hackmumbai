import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:3000/*", "https://credify-web.vercel.app/*"],
  run_at: "document_idle"
}

console.log("[Credify] Web Bridge content script loaded")

/**
 * Listen for standard custom window events from the webpage
 */
window.addEventListener("CREDIFY_WEB_EVENT", (event: CustomEvent) => {
  const { action, payload } = event.detail
  console.log(`[Credify Bridge] Received event: ${action}`, payload)

  // Forward to background script
  chrome.runtime.sendMessage({ action, payload }, (response) => {
    // Check for runtime errors
    if (chrome.runtime.lastError) {
      console.error("[Credify Bridge] Runtime error:", chrome.runtime.lastError)
      window.dispatchEvent(
        new CustomEvent("CREDIFY_EXT_RESPONSE", {
          detail: { 
            action: `${action}_RESPONSE`, 
            success: false, 
            error: "Extension background script unreachable" 
          }
        })
      )
      return
    }

    // Dispatch response back to Web App DOM
    console.log(`[Credify Bridge] Dispatching response for ${action}`, response)
    window.dispatchEvent(
      new CustomEvent("CREDIFY_EXT_RESPONSE", { 
        detail: response 
      })
    )
  })
})

/**
 * Send a heartbeat on mount to let the web app know the extension is installed
 */
window.dispatchEvent(
  new CustomEvent("CREDIFY_EXT_RESPONSE", {
    detail: { action: "HEARTBEAT", installed: true }
  })
)
