import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";

// Contract ABI
const EncryptedReadingPreferenceABI = [
  "function addCategoryPreference(uint32 categoryId, bytes32 encryptedCount, bytes calldata inputProof) external",
  "function getEncryptedCategoryCount(address user, uint32 categoryId) external view returns (bytes32)",
  "function hasInitialized(address user, uint32 categoryId) external view returns (bool)",
  "function getUserCategories(address user) external view returns (uint32[])",
  "function categoryExists(address user, uint32 categoryId) external view returns (bool)",
  "event CategoryPreferenceAdded(address indexed user, uint32 categoryId, uint256 timestamp)",
];

interface UseReadingPreferenceState {
  contractAddress: string | undefined;
  encryptedCounts: Map<number, string>;
  decryptedCounts: Map<number, number>;
  isLoading: boolean;
  fhevmStatus: string;
  message: string | undefined;
  userCategories: number[];
  addCategoryPreference: (categoryId: number, count: number) => Promise<void>;
  decryptCategoryCount: (categoryId: number) => Promise<void>;
  loadUserCategories: () => Promise<void>;
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Local storage keys
const STORAGE_KEY_DECRYPTED_COUNTS = 'liib-vault-decrypted-counts';
const STORAGE_KEY_USER_ADDRESS = 'liib-vault-user-address';
const STORAGE_KEY_CONTRACT_ADDRESS = 'liib-vault-contract-address';

// Helper functions for persistent storage
const saveDecryptedCounts = (address: string, counts: Map<number, number>) => {
  try {
    const data = {
      address,
      counts: Array.from(counts.entries()),
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_DECRYPTED_COUNTS, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY_USER_ADDRESS, address);
  } catch (error) {
    console.warn('Failed to save decrypted counts to localStorage:', error);
  }
};

const loadDecryptedCounts = (address: string): Map<number, number> => {
  try {
    const storedAddress = localStorage.getItem(STORAGE_KEY_USER_ADDRESS);
    if (storedAddress !== address) {
      // Different user, clear old data
      return new Map();
    }

    const storedData = localStorage.getItem(STORAGE_KEY_DECRYPTED_COUNTS);
    if (!storedData) return new Map();

    const data = JSON.parse(storedData);

    // Check if data is not too old (24 hours)
    const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem(STORAGE_KEY_DECRYPTED_COUNTS);
      return new Map();
    }

    return new Map(data.counts);
  } catch (error) {
    console.warn('Failed to load decrypted counts from localStorage:', error);
    return new Map();
  }
};

const clearDecryptedCounts = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_DECRYPTED_COUNTS);
    localStorage.removeItem(STORAGE_KEY_USER_ADDRESS);
  } catch (error) {
    console.warn('Failed to clear decrypted counts from localStorage:', error);
  }
};

export function useReadingPreference(): UseReadingPreferenceState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [encryptedCounts, setEncryptedCounts] = useState<Map<number, string>>(new Map());
  const [decryptedCounts, setDecryptedCounts] = useState<Map<number, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [userCategories, setUserCategories] = useState<number[]>([]);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!CONTRACT_ADDRESS,
  });

  // Update loading state based on FHEVM status
  useEffect(() => {
    if (fhevmStatus === 'loading' || fhevmStatus === 'idle') {
      setIsLoading(true);
    } else if (fhevmStatus === 'ready') {
      setIsLoading(false);
    }
    // Keep loading true on error to prevent button clicks
  }, [fhevmStatus]);

  // Load persistent decrypted data when user connects
  useEffect(() => {
    if (address && isConnected) {
      const persistentData = loadDecryptedCounts(address);
      console.log('[DEBUG] Loading persistent data for user', address, ':', Array.from(persistentData.entries()));
      if (persistentData.size > 0) {
        setDecryptedCounts(persistentData);
        setMessage(`Loaded ${persistentData.size} decrypted preferences from storage`);
      }
    } else {
      // Clear data when user disconnects
      setDecryptedCounts(new Map());
      setEncryptedCounts(new Map());
      setUserCategories([]);
      clearDecryptedCounts();
    }
  }, [address, isConnected]);

  // Clear local storage when contract address changes (redeploy)
  useEffect(() => {
    if (CONTRACT_ADDRESS) {
      // Check if this is a new deployment by comparing with stored contract address
      const storedContractAddress = localStorage.getItem(STORAGE_KEY_CONTRACT_ADDRESS);
      if (storedContractAddress && storedContractAddress !== CONTRACT_ADDRESS) {
        // Contract was redeployed, clear all local data
        clearDecryptedCounts();
        setDecryptedCounts(new Map());
        setEncryptedCounts(new Map());
        setUserCategories([]);
        setMessage('Contract redeployed, cleared local data');
      }
      localStorage.setItem(STORAGE_KEY_CONTRACT_ADDRESS, CONTRACT_ADDRESS);
    }
  }, [CONTRACT_ADDRESS]);

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  const addCategoryPreference = useCallback(
    async (categoryId: number, count: number) => {
      if (!CONTRACT_ADDRESS) {
        throw new Error("Contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env.local");
      }

      if (!ethersSigner || !fhevmInstance || !address || !ethersProvider) {
        throw new Error("Missing requirements for adding preference");
      }

      if (count < 1) {
        throw new Error("Count must be at least 1");
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting category preference...");

        // Encrypt count using FHEVM
        const encryptedInput = fhevmInstance.createEncryptedInput(
          CONTRACT_ADDRESS as `0x${string}`,
          address as `0x${string}`
        );
        encryptedInput.add32(count);
        const encrypted = await encryptedInput.encrypt();

        setMessage("Submitting to blockchain...");

        // Verify contract is deployed
        const contractCode = await ethersProvider.getCode(CONTRACT_ADDRESS);
        if (contractCode === "0x" || contractCode.length <= 2) {
          throw new Error(`Contract not deployed at ${CONTRACT_ADDRESS}`);
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, EncryptedReadingPreferenceABI, ethersSigner);

        const tx = await contract.addCategoryPreference(
          categoryId,
          encrypted.handles[0],
          encrypted.inputProof,
          {
            gasLimit: 5000000,
          }
        );
        await tx.wait();

        // Update encrypted counts immediately
        const handle = typeof encrypted.handles[0] === "string" ? encrypted.handles[0] : ethers.hexlify(encrypted.handles[0]);
        setEncryptedCounts(prev => new Map(prev.set(categoryId, handle.toLowerCase())));

        setMessage("Preference added successfully. Refreshing...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        await loadUserCategories();
      } catch (error: any) {
        const errorMessage = error.reason || error.message || String(error);
        setMessage(`Error: ${errorMessage}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [CONTRACT_ADDRESS, ethersSigner, fhevmInstance, address, ethersProvider]
  );

  const decryptCategoryCount = useCallback(
    async (categoryId: number) => {
      if (!CONTRACT_ADDRESS || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        setMessage("Missing requirements for decryption");
        return;
      }

      try {
        setMessage("Decrypting category count...");

        const contract = new ethers.Contract(CONTRACT_ADDRESS, EncryptedReadingPreferenceABI, ethersProvider);
        const hasInit = await contract.hasInitialized(address, categoryId);
        
        if (!hasInit) {
          throw new Error("Category not initialized. Please add preference first.");
        }

        const latestEncryptedCount = await contract.getEncryptedCategoryCount(address, categoryId);
        let handle = typeof latestEncryptedCount === "string" ? latestEncryptedCount : ethers.hexlify(latestEncryptedCount);

        if (handle && handle.startsWith("0x")) {
          handle = handle.toLowerCase();
        }

        if (!handle || handle === "0x" || handle.length !== 66) {
          throw new Error(`Invalid handle format: ${handle}`);
        }

        setEncryptedCounts(prev => new Map(prev.set(categoryId, handle)));

        // Prepare handle-contract pairs
        const handleContractPairs = [
          { handle, contractAddress: CONTRACT_ADDRESS as `0x${string}` },
        ];

        // Generate keypair for EIP712 signature
        let keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
        if (typeof (fhevmInstance as any).generateKeypair === "function") {
          keypair = (fhevmInstance as any).generateKeypair();
        } else {
          keypair = {
            publicKey: new Uint8Array(32).fill(0),
            privateKey: new Uint8Array(32).fill(0),
          };
        }

        // Create EIP712 signature for decryption
        const contractAddresses = [CONTRACT_ADDRESS as `0x${string}`];
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";

        let eip712: any;
        if (typeof (fhevmInstance as any).createEIP712 === "function") {
          eip712 = (fhevmInstance as any).createEIP712(
            keypair.publicKey,
            contractAddresses,
            startTimestamp,
            durationDays
          );
        } else {
          eip712 = {
            domain: {
              name: "FHEVM",
              version: "1",
              chainId: chainId,
              verifyingContract: contractAddresses[0],
            },
            types: {
              UserDecryptRequestVerification: [
                { name: "publicKey", type: "bytes" },
                { name: "contractAddresses", type: "address[]" },
                { name: "startTimestamp", type: "string" },
                { name: "durationDays", type: "string" },
              ],
            },
            message: {
              publicKey: ethers.hexlify(keypair.publicKey),
              contractAddresses,
              startTimestamp,
              durationDays,
            },
          };
        }

        // Sign the EIP712 message
        const signature = await ethersSigner.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );

        const signatureForDecrypt = chainId === 31337 
          ? signature.replace("0x", "") 
          : signature;

        // Decrypt using userDecrypt method
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signatureForDecrypt,
          contractAddresses,
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        const decrypted = Number(decryptedResult[handle] || 0);
        setDecryptedCounts(prev => {
          const newCounts = new Map(prev.set(categoryId, decrypted));
          // Save to persistent storage
          if (address) {
            saveDecryptedCounts(address, newCounts);
          }
          return newCounts;
        });
        setMessage(`Decrypted count for category ${categoryId}: ${decrypted}`);
      } catch (error: any) {
        console.error("[useReadingPreference] Error decrypting:", error);
        const errorMessage = error.message || String(error);
        setMessage(`Error decrypting: ${errorMessage}`);
        throw error;
      }
    },
    [CONTRACT_ADDRESS, ethersProvider, fhevmInstance, ethersSigner, address, chainId]
  );

  const loadUserCategories = useCallback(async () => {
    if (!CONTRACT_ADDRESS || !ethersProvider || !address) {
      return;
    }

    try {
      setIsLoading(true);

      const contractCode = await ethersProvider.getCode(CONTRACT_ADDRESS);
      if (contractCode === "0x" || contractCode.length <= 2) {
        setMessage(`Contract not deployed at ${CONTRACT_ADDRESS}`);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, EncryptedReadingPreferenceABI, ethersProvider);
      const categories = await contract.getUserCategories(address);

      const categoryIds = categories.map((cat: bigint) => Number(cat));
      setUserCategories(categoryIds);

      // Load encrypted handles for all categories
      const newEncryptedCounts = new Map();
      for (const categoryId of categoryIds) {
        try {
          const encryptedCount = await contract.getEncryptedCategoryCount(address, categoryId);
          let handle = typeof encryptedCount === "string" ? encryptedCount : ethers.hexlify(encryptedCount);
          if (handle && handle.startsWith("0x")) {
            handle = handle.toLowerCase();
          }
          if (handle && handle !== "0x" && handle.length === 66) {
            newEncryptedCounts.set(categoryId, handle);
          }
        } catch (error) {
          // Skip categories that don't have encrypted data yet
          console.warn(`Failed to load encrypted data for category ${categoryId}:`, error);
        }
      }
      setEncryptedCounts(newEncryptedCounts);
    } catch (error: any) {
      console.error("[useReadingPreference] Error loading categories:", error);
      setMessage(`Error loading categories: ${error.message || String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [CONTRACT_ADDRESS, ethersProvider, address]);

  useEffect(() => {
    if (CONTRACT_ADDRESS && ethersProvider && address) {
      loadUserCategories();
    }
  }, [CONTRACT_ADDRESS, ethersProvider, address, loadUserCategories]);

  return {
    contractAddress: CONTRACT_ADDRESS,
    encryptedCounts,
    decryptedCounts,
    isLoading,
    fhevmStatus,
    message,
    userCategories,
    addCategoryPreference,
    decryptCategoryCount,
    loadUserCategories,
  };
}

