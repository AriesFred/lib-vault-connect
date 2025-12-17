const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 测试合约基本功能\n");

  // 获取合约实例
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  try {
    const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
    const contract = EncryptedReadingPreference.attach(contractAddress);

    console.log(`📍 合约地址: ${contractAddress}`);

    // 测试合约是否部署
    const code = await ethers.provider.getCode(contractAddress);
    console.log(`📄 合约代码长度: ${code.length}`);
    console.log(`✅ 合约已部署: ${code !== "0x"}`);

    // 测试基本调用
    console.log("\n🔍 测试基本调用:");
    const version = await contract.version();
    console.log(`   版本: ${version}`);

    // 获取当前账户
    const [signer] = await ethers.getSigners();
    console.log(`👤 测试账户: ${signer.address}`);

    // 测试获取用户类别 (应该返回空数组)
    console.log("\n📚 测试获取用户类别:");
    const categories = await contract.getUserCategories(signer.address);
    console.log(`   类别数量: ${categories.length}`);
    console.log(`   类别列表: [${categories.map(c => Number(c)).join(", ")}]`);

    console.log("\n✅ 合约基本功能正常!");

  } catch (error) {
    console.error("❌ 合约测试失败:", error.message);
    console.error("错误详情:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("脚本执行失败:", error);
    process.exit(1);
  });
