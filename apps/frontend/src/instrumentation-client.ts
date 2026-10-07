import "./browser-contract-validation";
import { installPrivateBrowserConsole } from "./features/diagnostics/browser-console";
import { reportBrowserDiagnostic } from "./features/diagnostics/browser.diagnostics";

// Next runs this client-only entry before hydration and framework console binding.
installPrivateBrowserConsole(window.console, window, (record) => {
  void reportBrowserDiagnostic(record);
});
