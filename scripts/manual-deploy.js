const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 手动部署合约\n");

  // 获取合约工厂
  const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");

  console.log("📦 部署 EncryptedReadingPreference...");

  // 部署合约
  const contract = await EncryptedReadingPreference.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log(`✅ 合约部署成功!`);
  console.log(`📍 地址: ${contractAddress}`);

  // 测试合约功能
  console.log("\n🧪 测试合约功能:");
  try {
    const version = await contract.version();
    console.log(`✅ version(): ${version}`);
  } catch (error) {
    console.log(`❌ version() 失败: ${error.message}`);
  }

  // 获取当前账户并测试用户方法
  const [deployer] = await ethers.getSigners();
  console.log(`👤 测试账户: ${deployer.address}`);

  try {
    const categories = await contract.getUserCategories(deployer.address);
    console.log(`✅ getUserCategories(): [${categories.map(c => Number(c)).join(", ")}]`);
  } catch (error) {
    console.log(`❌ getUserCategories() 失败: ${error.message}`);
  }

  // 更新前端环境变量
  const fs = require('fs');
  const path = require('path');

  try {
    const envPath = path.join(__dirname, '../frontend/.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`📝 已更新 frontend/.env.local`);
  } catch (error) {
    console.log(`⚠️ 无法更新环境变量: ${error.message}`);
  }

  console.log("\n🎉 部署完成!");
  console.log("=" .repeat(50));
  console.log(`📋 合约: EncryptedReadingPreference`);
  console.log(`📍 地址: ${contractAddress}`);
  console.log(`🌐 网络: hardhat`);
  console.log("=" .repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });
