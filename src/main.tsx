
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAdMob } from "./utils/admob";
import { initBilling } from "./utils/billing";

// Initialize native plugins as soon as the app starts
const initPlugins = async () => {
  try {
    // Start AdMob and Billing connections immediately
    await initAdMob();
    await initBilling();
    console.log('[Main] Native plugins initialized');
  } catch (e) {
    console.error('[Main] Plugin init error:', e);
  }
};

initPlugins();

createRoot(document.getElementById("root")!).render(<App />);
