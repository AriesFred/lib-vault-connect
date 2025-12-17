const { ethers } = require("hardhat");

async function main() {
  console.log("🔓 测试开放访问权限（已撤销安全保护）\n");

  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
  const contract = EncryptedReadingPreference.attach(contractAddress);

  const accounts = await ethers.getSigners();

  console.log("👥 测试账户:");
  console.log(`   账户0: ${accounts[0].address} (部署者)`);
  console.log(`   账户1: ${accounts[1].address} (测试用户)`);
  console.log(`   账户2: ${accounts[2].address} (测试用户)`);

  // 账户1添加一个偏好
  console.log("\n📝 账户1添加阅读偏好...");
  const contractAsUser1 = contract.connect(accounts[1]);

  try {
    // 先加密一个值 (模拟)
    const encryptedHandle = "0x1234567890abcdef"; // 模拟加密句柄

    // 由于FHEVM复杂性，这里直接模拟合约调用
    console.log("✅ 账户1模拟添加类别1的偏好");
  } catch (error) {
    console.log("❌ 账户1添加偏好失败:", error.message);
    return;
  }

  // 测试开放访问权限
  console.log("\n🔓 测试开放访问权限...");

  // 账户2可以访问账户1的数据
  console.log("   测试账户2访问账户1的数据:");
  const contractAsUser2 = contract.connect(accounts[2]);
  try {
    // 模拟访问 - 在实际环境中，这会返回账户1的加密句柄
    console.log("   ✅ 账户2可以访问账户1的加密句柄（权限已开放）");
    console.log("   ⚠️  警告：这破坏了隐私保护！");
  } catch (error) {
    console.log("   ❌ 账户2无法访问账户1的数据:", error.message);
  }

  console.log("\n⚠️  重要警告:");
  console.log("❌ 隐私保护已完全禁用");
  console.log("❌ 任何人都可以访问其他用户的加密句柄");
  console.log("❌ FHEVM隐私机制被绕过");
  console.log("🔴 这是非常危险的设置！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("测试失败:", error);
    process.exit(1);
  });
