import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";
import * as path from "path";

const deployEncryptedReadingPreference: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { network } = hre;

  const deployment = await deploy("EncryptedReadingPreference", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const contractAddress = deployment.address;
  console.log(`\n✅ EncryptedReadingPreference deployed to: ${contractAddress}`);
  console.log(`📋 Network: ${network.name}`);
  console.log(`👤 Deployer: ${deployer}\n`);


  // Also save to deployments directory for reference
  try {
    const deploymentsDir = path.join(__dirname, `../deployments/${network.name}`);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
      network: network.name,
      contractAddress: contractAddress,
      deployer: deployer,
      transactionHash: deployment.transactionHash || "",
      deployedAt: new Date().toISOString(),
      chainId: network.config.chainId,
    };

    const deploymentFilePath = path.join(
      deploymentsDir,
      "EncryptedReadingPreference.json"
    );
    fs.writeFileSync(
      deploymentFilePath,
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`📁 Deployment info saved to: deployments/${network.name}/EncryptedReadingPreference.json`);
  } catch (error: any) {
    console.warn(`⚠️  Could not save deployment info: ${error.message}`);
  }

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log(`📋 Contract: EncryptedReadingPreference`);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network.name}`);
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log(`🔍 View on Etherscan: https://${network.name === "sepolia" ? "sepolia." : ""}etherscan.io/address/${contractAddress}`);
  }
  console.log("=".repeat(60) + "\n");
};

export default deployEncryptedReadingPreference;

deployEncryptedReadingPreference.tags = ["EncryptedReadingPreference"];

