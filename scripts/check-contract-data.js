const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查合约数据和账户权限\n");

  // 获取合约实例
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
  const contract = EncryptedReadingPreference.attach(contractAddress);

  // 获取所有账户
  const accounts = await ethers.getSigners();
  console.log("📋 Hardhat 账户列表:");
  accounts.forEach((account, index) => {
    console.log(`${index}: ${account.address}`);
  });

  console.log("\n" + "=".repeat(50));

  // 检查每个账户的类别
  for (let i = 0; i < Math.min(accounts.length, 5); i++) {
    const account = accounts[i];
    console.log(`\n👤 账户 ${i}: ${account.address}`);

    try {
      // 获取用户类别
      const categories = await contract.getUserCategories(account.address);
      console.log(`   📚 类别数量: ${categories.length}`);

      if (categories.length > 0) {
        console.log(`   📖 类别ID: [${categories.join(", ")}]`);

        // 检查每个类别的初始化状态
        for (const categoryId of categories) {
          const hasInit = await contract.hasInitialized(account.address, categoryId);
          console.log(`      类别 ${categoryId}: ${hasInit ? "✅ 已初始化" : "❌ 未初始化"}`);
        }
      } else {
        console.log(`   📭 无类别数据`);
      }
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎯 当前连接账户 (索引0):", accounts[0].address);
  console.log("💡 如果类别5无法解密，可能是账户切换导致的权限问题");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
