import { JsonRpcProvider } from "ethers";
import type { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import { RelayerSDKLoader, isFhevmWindowType } from "../RelayerSDKLoader";
import { FHEVM_RELAYER_URL, FHEVM_MOCK_RELAYER_URL } from "../constants";

// Browser compatibility check removed - following proof-quill-shine-main approach
// FHEVM SDK will handle SharedArrayBuffer requirements internally

// Helper function to check if we're in local development environment
function isLocalDevelopment(provider: string | Eip1193Provider | undefined): boolean {
  if (typeof provider === "string") {
    return provider.includes("localhost") || provider.includes("127.0.0.1") || provider.includes("8545");
  }
  return false;
}

// Helper function to try fetching Hardhat FHEVM metadata
async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<{
  ACLAddress: `0x${string}`;
  InputVerifierAddress: `0x${string}`;
  KMSVerifierAddress: `0x${string}`;
} | undefined> {
  try {
    const rpc = new JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
    });

    try {
      // Check if it's a Hardhat node
      const version = await Promise.race([
        rpc.send("web3_clientVersion", []),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("RPC request timeout")), 5000)
        ),
      ]);

      if (typeof version === "string" && version.toLowerCase().includes("hardhat")) {
        // Try to get FHEVM metadata
        const metadata = await Promise.race([
          rpc.send("fhevm_relayer_metadata", []),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("RPC request timeout")), 5000)
          ),
        ]);

        if (metadata && typeof metadata === "object") {
          return metadata as {
            ACLAddress: `0x${string}`;
            InputVerifierAddress: `0x${string}`;
            KMSVerifierAddress: `0x${string}`;
          };
        }
      }
    } finally {
      rpc.destroy();
    }
  } catch (error) {
    console.log("[FHEVM] Could not fetch Hardhat FHEVM metadata:", error);
  }

  return undefined;
}

export async function createFhevmInstance(params: {
  provider: string | Eip1193Provider | undefined;
  mockChains?: Readonly<Record<number, string>>;
  signal?: AbortSignal;
  onStatusChange?: (status: string) => void;
}): Promise<FhevmInstance> {
  const { provider, mockChains, signal, onStatusChange } = params;

  if (typeof window === "undefined") {
    throw new Error("FHEVM can only be initialized in browser environment");
  }

  // Check if we're in local development environment
  const isLocalDev = isLocalDevelopment(provider);

  if (isLocalDev && typeof provider === "string") {
    console.log("[FHEVM] Detected local development environment, attempting to use mock instance...");

    // Try to fetch Hardhat FHEVM metadata
    const metadata = await tryFetchFHEVMHardhatNodeRelayerMetadata(provider);
    if (metadata) {
      console.log("[FHEVM] Hardhat node FHEVM metadata found, using mock instance:", metadata);

      onStatusChange?.("creating");

      // Dynamically import mock implementation to avoid bundling it in production
      const { fhevmMockCreateInstance } = await import("./mock/fhevmMock");

      const mockInstance = await fhevmMockCreateInstance({
        rpcUrl: provider,
        chainId: 31337, // Hardhat default chainId
        metadata,
      });

      console.log("[FHEVM] Mock FHEVM instance created successfully");
      return mockInstance;
    } else {
      console.warn("[FHEVM] Hardhat node FHEVM metadata not found. Falling back to real FHEVM instance.");
    }
  }

  // Removed browser compatibility check - let FHEVM SDK handle it internally
  // This follows the approach used in proof-quill-shine-main project

  // Load SDK if not already loaded
  onStatusChange?.("sdk-loading");
  if (!isFhevmWindowType(window, console.log)) {
    console.log("[FHEVM] SDK not found, loading...");
    const loader = new RelayerSDKLoader({ trace: console.log });
    await loader.load();
    console.log("[FHEVM] SDK load completed");
  } else {
    console.log("[FHEVM] SDK already available");
  }
  onStatusChange?.("sdk-loaded");

  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("Relayer SDK not loaded. Please check network connection and CDN availability.");
  }

  // Initialize SDK if not already initialized
  if (!window.relayerSDK.__initialized__) {
    console.log("[FHEVM] Initializing SDK...");
    onStatusChange?.("sdk-initializing");
    try {
      const initialized = await window.relayerSDK.initSDK();
      window.relayerSDK.__initialized__ = initialized;
      if (!initialized) {
        throw new Error("SDK initSDK() returned false");
      }
      console.log("[FHEVM] SDK initialized successfully");
      onStatusChange?.("sdk-initialized");
    } catch (error: any) {
      console.error("[FHEVM] SDK initialization failed:", error);
      throw new Error(`Failed to initialize FHEVM SDK: ${error.message}`);
    }
  } else {
    console.log("[FHEVM] SDK already initialized");
    onStatusChange?.("sdk-initialized");
  }

  onStatusChange?.("creating");

  const chainId = await getChainId(provider);
  const isMock = mockChains && chainId && mockChains[chainId];

  const config = {
    provider,
    relayerUrl: isMock ? FHEVM_MOCK_RELAYER_URL : FHEVM_RELAYER_URL,
    chainId,
  };

  if (signal) {
    signal.addEventListener("abort", () => {
      // Handle abort if needed
    });
  }

  const instance = await window.relayerSDK.createInstance(config);
  return instance;
}

async function getChainId(provider: string | Eip1193Provider | undefined): Promise<number> {
  try {
    if (typeof provider === "string") {
      const rpc = new JsonRpcProvider(provider, undefined, {
        staticNetwork: true,
      });
      try {
        const chainId = await Promise.race([
          rpc.send("eth_chainId", []),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Provider request timeout")), 10000)
          ),
        ]);
        return Number.parseInt(chainId as string, 16);
      } finally {
        rpc.destroy();
      }
    } else if (provider && typeof provider.request === "function") {
      const chainId = await Promise.race([
        provider.request({ method: "eth_chainId" }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Provider request timeout")), 10000)
        ),
      ]);
      return Number.parseInt(chainId as string, 16);
    }
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
      if (typeof provider === "string") {
        if (provider.includes("localhost") || provider.includes("127.0.0.1")) {
          return 31337;
        }
        throw new Error("CHAIN_ID_UNAVAILABLE");
      }
      throw new Error("CHAIN_ID_UNAVAILABLE");
    }
    throw error;
  }

  return 31337; // Default to hardhat
}

