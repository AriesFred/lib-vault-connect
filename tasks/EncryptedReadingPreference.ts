import { task } from "hardhat/config";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("encrypted-reading-preference", "Interact with EncryptedReadingPreference contract")
  .addParam("action", "Action to perform: add, get, decrypt, list")
  .addOptionalParam("category", "Category ID (for add/get/decrypt)", "1")
  .addOptionalParam("count", "Count to add (for add)", "1")
  .addOptionalParam("user", "User address (for get/decrypt/list)", "")
  .setAction(async (taskArgs, hre) => {
    // Access hardhat modules through hre
    const { ethers, fhevm } = hre;
    const { EncryptedReadingPreference } = await import("../types");

    const { action, category, count, user } = taskArgs;
    const categoryId = parseInt(category);
    const countValue = parseInt(count);

    const signers: HardhatEthersSigner[] = await hre.ethers.getSigners();
    const deployer = signers[0];
    const userAddress = user || deployer.address;

    let contract: EncryptedReadingPreference;
    let contractAddress: string;

    try {
      const deployment = await hre.deployments.get("EncryptedReadingPreference");
      contractAddress = deployment.address;
      contract = await hre.ethers.getContractAt("EncryptedReadingPreference", contractAddress);
    } catch (e) {
      console.error("Contract not deployed. Please deploy first using: npx hardhat deploy");
      process.exit(1);
    }

    if (action === "add") {
      console.log(`Adding preference: Category ${categoryId}, Count ${countValue}`);
      
      if (!fhevm.isMock) {
        console.warn("This task is designed for local mock environment");
        process.exit(1);
      }

      const encryptedCount = await fhevm
        .createEncryptedInput(contractAddress, deployer.address)
        .add32(countValue)
        .encrypt();

      const tx = await contract
        .connect(deployer)
        .addCategoryPreference(categoryId, encryptedCount.handles[0], encryptedCount.inputProof);
      await tx.wait();

      console.log(`Transaction hash: ${tx.hash}`);
      console.log(`Preference added successfully!`);
    } else if (action === "get") {
      console.log(`Getting encrypted count for user ${userAddress}, category ${categoryId}`);
      
      const encryptedCount = await contract.getEncryptedCategoryCount(userAddress, categoryId);
      console.log(`Encrypted count: ${encryptedCount}`);
    } else if (action === "decrypt") {
      console.log(`Decrypting count for user ${userAddress}, category ${categoryId}`);
      
      if (!fhevm.isMock) {
        console.warn("This task is designed for local mock environment");
        process.exit(1);
      }

      const encryptedCount = await contract.getEncryptedCategoryCount(userAddress, categoryId);
      const clearCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        contractAddress,
        deployer,
      );

      console.log(`Decrypted count: ${clearCount}`);
    } else if (action === "list") {
      console.log(`Listing categories for user ${userAddress}`);
      
      const categories = await contract.getUserCategories(userAddress);
      console.log(`User categories: ${categories.join(", ")}`);
      
      for (const catId of categories) {
        const hasInit = await contract.hasInitialized(userAddress, catId);
        console.log(`  Category ${catId}: initialized=${hasInit}`);
      }
    } else {
      console.error(`Unknown action: ${action}`);
      console.error("Available actions: add, get, decrypt, list");
      process.exit(1);
    }
  });

