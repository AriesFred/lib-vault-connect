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
        setDecryptedCounts(prev => new Map(prev.set(categoryId, decrypted)));
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

