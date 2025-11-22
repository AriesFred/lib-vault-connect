import { useEffect, useState } from "react";

const FHEStatus = () => {
  const [browserSupported, setBrowserSupported] = useState<boolean | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Skip browser compatibility check - following proof-quill-shine-main approach
    // FHEVM SDK will handle SharedArrayBuffer requirements internally
    const checkCompatibility = () => {
      setBrowserSupported(true);
    };

    // Check if SDK is loaded
    const checkSdkStatus = () => {
      if (window.relayerSDK) {
        setSdkLoaded(true);
        if (window.relayerSDK.__initialized__) {
          setSdkInitialized(true);
        }
      }
    };

    checkCompatibility();
    checkSdkStatus();

    // Check periodically
    const interval = setInterval(() => {
      checkSdkStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (browserSupported === false) return "text-orange-500"; // Changed to orange to indicate known issue
    if (error) return "text-orange-500";
    if (sdkInitialized) return "text-green-500";
    if (sdkLoaded) return "text-yellow-500";
    return "text-gray-500";
  };

  const getStatusText = () => {
    if (browserSupported === false) return "Wallet SDK Conflict";
    if (error) return "SDK Conflict Detected";
    if (sdkInitialized) return "FHEVM Ready";
    if (sdkLoaded) return "SDK Loaded";
    return "Checking...";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-3 shadow-lg z-50 max-w-xs cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
      <div className="text-xs text-muted-foreground mb-1">FHEVM Status</div>
      <div className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      {error && (
        <div className="text-xs text-orange-500 mt-1 break-words">
          {error}
        </div>
      )}
      {showDetails && (
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <div>• COOP/COEP headers conflict with Base Account SDK</div>
          <div>• FHEVM requires: COOP=same-origin, COEP=require-corp</div>
          <div>• Base SDK requires: COOP≠same-origin</div>
          <div>• Status: {sdkInitialized ? "SDK Ready" : "SDK Not Ready"}</div>
        </div>
      )}
    </div>
  );
};

export default FHEStatus;
