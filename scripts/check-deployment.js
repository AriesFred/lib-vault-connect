const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查部署状态\n");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // 检查合约代码
  const code = await ethers.provider.getCode(contractAddress);
  console.log(`📄 合约地址: ${contractAddress}`);
  console.log(`📏 代码长度: ${code.length} 字节`);
  console.log(`✅ 合约存在: ${code !== "0x"}`);

  if (code === "0x") {
    console.log("❌ 合约未部署或已被销毁");
    return;
  }

  try {
    // 尝试获取合约实例
    const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
    const contract = EncryptedReadingPreference.attach(contractAddress);

    console.log("\n🔍 测试合约方法:");

    // 测试version方法
    try {
      const version = await contract.version();
      console.log(`✅ version(): ${version}`);
    } catch (error) {
      console.log(`❌ version() 失败: ${error.message}`);
    }

    // 测试getUserCategories方法 (部署者)
    try {
      const [deployer] = await ethers.getSigners();
      const categories = await contract.getUserCategories(deployer.address);
      console.log(`✅ getUserCategories(${deployer.address}): [${categories.map(c => Number(c)).join(", ")}]`);
    } catch (error) {
      console.log(`❌ getUserCategories() 失败: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ 合约实例化失败: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("脚本执行失败:", error);
    process.exit(1);
  });
