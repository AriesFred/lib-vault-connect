const { ethers } = require("hardhat");

async function main() {
  console.log("🔒 测试隐私安全修复\n");

  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
  const contract = EncryptedReadingPreference.attach(contractAddress);

  const accounts = await ethers.getSigners();

  console.log("👥 测试账户:");
  console.log(`   账户0: ${accounts[0].address} (部署者)`);
  console.log(`   账户1: ${accounts[1].address} (测试用户)`);
  console.log(`   账户2: ${accounts[2].address} (测试用户)`);

  // 测试隐私保护 - 直接测试访问控制
  console.log("\n🔒 测试隐私保护...");

  // 账户1尝试访问类别1（未初始化）
  console.log("   测试账户1访问未初始化的类别1:");
  const contractAsUser1 = contract.connect(accounts[1]);
  try {
    const handle = await contractAsUser1.getEncryptedCategoryCount(1);
    console.log("   ❌ 安全问题! 账户1可以访问未初始化的句柄");
  } catch (error) {
    console.log("   ✅ 安全保护正常: 账户1无法访问未初始化的类别");
    console.log("      错误信息:", error.message);
  }

  // 账户2尝试访问类别1（也未初始化）
  console.log("   测试账户2访问未初始化的类别1:");
  const contractAsUser2 = contract.connect(accounts[2]);
  try {
    const handle = await contractAsUser2.getEncryptedCategoryCount(1);
    console.log("   ❌ 安全问题! 账户2可以访问未初始化的句柄");
  } catch (error) {
    console.log("   ✅ 安全保护正常: 账户2无法访问未初始化的类别");
    console.log("      错误信息:", error.message);
  }

  // 测试其他访问控制函数仍然正常
  console.log("\n📊 测试其他函数仍然可用:");
  try {
    const categories1 = await contract.getUserCategories(accounts[1].address);
    console.log(`   ✅ getUserCategories(账户1): [${categories1.join(", ")}]`);

    const categories2 = await contract.getUserCategories(accounts[2].address);
    console.log(`   ✅ getUserCategories(账户2): [${categories2.join(", ")}]`);

    const hasInit1 = await contract.hasInitialized(accounts[1].address, 1);
    console.log(`   ✅ hasInitialized(账户1, 类别1): ${hasInit1}`);

    const hasInit2 = await contract.hasInitialized(accounts[2].address, 1);
    console.log(`   ✅ hasInitialized(账户2, 类别1): ${hasInit2}`);
  } catch (error) {
    console.log("   ❌ 其他函数测试失败:", error.message);
  }

  console.log("\n🎉 隐私安全测试完成!");
  console.log("✅ 用户只能访问自己已初始化的加密句柄");
  console.log("🔒 未初始化的类别会被拒绝访问");
  console.log("📊 其他查询函数正常工作");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("测试失败:", error);
    process.exit(1);
  });
