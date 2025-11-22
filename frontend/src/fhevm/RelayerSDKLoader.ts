import { SDK_CDN_URL } from "./constants";

type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;

export type FhevmRelayerSDKType = {
  initSDK: (options?: any) => Promise<boolean>;
  createInstance: (config: any) => Promise<any>;
  SepoliaConfig?: any;
  __initialized__?: boolean;
};

export type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

export class RelayerSDKLoader {
  private _trace?: TraceType;

  constructor(options: { trace?: TraceType }) {
    this._trace = options?.trace;
  }

  public isLoaded() {
    if (typeof window === "undefined") {
      throw new Error("RelayerSDKLoader: can only be used in the browser.");
    }
    return isFhevmWindowType(window, this._trace);
  }

  public load(): Promise<void> {
    console.log("[RelayerSDKLoader] load...");
    if (typeof window === "undefined") {
      console.log("[RelayerSDKLoader] window === undefined");
      return Promise.reject(
        new Error("RelayerSDKLoader: can only be used in the browser.")
      );
    }

    if ("relayerSDK" in window) {
      if (!isFhevmRelayerSDKType(window.relayerSDK, this._trace)) {
        console.log("[RelayerSDKLoader] window.relayerSDK exists but invalid");
        throw new Error("RelayerSDKLoader: Unable to load FHEVM Relayer SDK");
      }
      console.log("[RelayerSDKLoader] SDK already loaded");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${SDK_CDN_URL}"]`
      );
      if (existingScript) {
        console.log("[RelayerSDKLoader] Script already exists in DOM");
        // Wait a bit for the script to load
        setTimeout(() => {
          if (isFhevmWindowType(window, this._trace)) {
            resolve();
          } else {
            reject(
              new Error(
                "RelayerSDKLoader: Script exists but SDK not available."
              )
            );
          }
        }, 1000);
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_CDN_URL;
      script.type = "text/javascript";
      script.async = true;
      script.crossOrigin = "anonymous";

      let loadTimeout: NodeJS.Timeout;

      script.onload = () => {
        console.log("[RelayerSDKLoader] Script loaded successfully");
        clearTimeout(loadTimeout);

        // Give some time for the SDK to initialize
        setTimeout(() => {
          if (isFhevmWindowType(window, this._trace)) {
            console.log("[RelayerSDKLoader] SDK ready");
            resolve();
          } else {
            console.error("[RelayerSDKLoader] Script loaded but SDK not available");
            reject(
              new Error(
                `RelayerSDKLoader: Script loaded from ${SDK_CDN_URL}, but SDK not available on window.`
              )
            );
          }
        }, 500);
      };

      script.onerror = (event) => {
        console.error("[RelayerSDKLoader] Script load error:", event);
        clearTimeout(loadTimeout);
        reject(
          new Error(
            `RelayerSDKLoader: Failed to load Relayer SDK from ${SDK_CDN_URL}`
          )
        );
      };

      // Add timeout for loading
      loadTimeout = setTimeout(() => {
        console.error("[RelayerSDKLoader] Script load timeout");
        reject(
          new Error(
            `RelayerSDKLoader: Timeout loading SDK from ${SDK_CDN_URL}`
          )
        );
      }, 30000); // 30 second timeout

      console.log("[RelayerSDKLoader] Adding script to DOM...");
      document.head.appendChild(script);
      console.log("[RelayerSDKLoader] Script added to DOM");
    });
  }
}

function isFhevmRelayerSDKType(
  o: unknown,
  trace?: TraceType
): o is FhevmRelayerSDKType {
  if (typeof o === "undefined") {
    trace?.("RelayerSDKLoader: relayerSDK is undefined");
    return false;
  }
  if (o === null) {
    trace?.("RelayerSDKLoader: relayerSDK is null");
    return false;
  }
  if (typeof o !== "object") {
    trace?.("RelayerSDKLoader: relayerSDK is not an object");
    return false;
  }
  if (!objHasProperty(o, "initSDK", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.initSDK is invalid");
    return false;
  }
  if (!objHasProperty(o, "createInstance", "function", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.createInstance is invalid");
    return false;
  }
  if (!objHasProperty(o, "SepoliaConfig", "object", trace)) {
    trace?.("RelayerSDKLoader: relayerSDK.SepoliaConfig is invalid");
    return false;
  }
  if ("__initialized__" in o) {
    if (o.__initialized__ !== true && o.__initialized__ !== false) {
      trace?.("RelayerSDKLoader: relayerSDK.__initialized__ is invalid");
      return false;
    }
  }
  return true;
}

export function isFhevmWindowType(
  win: unknown,
  trace?: TraceType
): win is FhevmWindowType {
  if (typeof win === "undefined") {
    trace?.("RelayerSDKLoader: window object is undefined");
    return false;
  }
  if (win === null) {
    trace?.("RelayerSDKLoader: window object is null");
    return false;
  }
  if (typeof win !== "object") {
    trace?.("RelayerSDKLoader: window is not an object");
    return false;
  }
  if (!("relayerSDK" in win)) {
    trace?.("RelayerSDKLoader: window does not contain 'relayerSDK' property");
    return false;
  }
  return isFhevmRelayerSDKType(win.relayerSDK);
}

function objHasProperty<
  T extends object,
  K extends PropertyKey,
  V extends string
>(
  obj: T,
  propertyName: K,
  propertyType: V,
  trace?: TraceType
): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  if (!(propertyName in obj)) {
    trace?.(`RelayerSDKLoader: missing ${String(propertyName)}.`);
    return false;
  }

  const value = (obj as Record<K, unknown>)[propertyName];

  if (value === null || value === undefined) {
    trace?.(`RelayerSDKLoader: ${String(propertyName)} is null or undefined.`);
    return false;
  }

  if (typeof value !== propertyType) {
    if (trace) {
      trace(`RelayerSDKLoader: ${String(propertyName)} is not a ${propertyType}.`);
    }
    return false;
  }

  return true;
}

