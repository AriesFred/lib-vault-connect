const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查用户数据详情\n");

  // 获取合约实例
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedReadingPreference = await ethers.getContractFactory("EncryptedReadingPreference");
  const contract = EncryptedReadingPreference.attach(contractAddress);

  // 用户当前使用的账户 (从日志中看到)
  const userAddress = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30";
  console.log(`👤 检查用户: ${userAddress}`);

  try {
    // 获取用户类别
    console.log("\n📚 获取用户类别...");
    const categories = await contract.getUserCategories(userAddress);
    console.log(`   类别数量: ${categories.length}`);
    console.log(`   类别ID列表: [${categories.map(c => Number(c)).join(", ")}]`);

    // 检查每个类别的状态
    console.log("\n🔍 检查每个类别状态:");
    const categoryNames = {
      1: "Science Fiction",
      2: "Mystery",
      3: "Romance",
      4: "Fantasy",
      5: "Thriller",
      6: "Non-Fiction",
      7: "Biography",
      8: "History"
    };

    for (const categoryId of categories) {
      const id = Number(categoryId);
      const name = categoryNames[id] || `Category ${id}`;

      try {
        const hasInit = await contract.hasInitialized(userAddress, id);
        console.log(`   ${name} (ID:${id}): ${hasInit ? "✅ 已初始化" : "❌ 未初始化"}`);

        if (hasInit) {
          // 尝试获取句柄 (只检查，不解密)
          try {
            const handle = await contract.getEncryptedCategoryCount(userAddress, id);
            console.log(`      句柄: ${handle} (${handle !== "0x" ? "有效" : "无效"})`);
          } catch (error) {
            console.log(`      句柄获取失败: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ${name} (ID:${id}): 状态检查失败 - ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 总结:");
    console.log(`   用户地址: ${userAddress}`);
    console.log(`   总类别数: ${categories.length}`);
    console.log(`   Thriller (ID:5): ${categories.some(c => Number(c) === 5) ? "存在" : "不存在"}`);

    if (categories.some(c => Number(c) === 5)) {
      console.log("   💡 Thriller类别存在，但解密权限被拒绝");
      console.log("   🔒 这表明类别5可能由其他账户创建，或存在权限问题");
    }

  } catch (error) {
    console.log(`❌ 获取用户数据失败: ${error.message}`);
  }

  // 同时检查部署者账户
  const accounts = await ethers.getSigners();
  const deployerAddress = accounts[0].address;
  console.log(`\n👑 部署者账户: ${deployerAddress}`);

  try {
    const deployerCategories = await contract.getUserCategories(deployerAddress);
    console.log(`   部署者类别数: ${deployerCategories.length}`);
    if (deployerCategories.length > 0) {
      console.log(`   部署者类别: [${deployerCategories.map(c => Number(c)).join(", ")}]`);
    }
  } catch (error) {
    console.log(`   部署者数据检查失败: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("脚本执行失败:", error);
    process.exit(1);
  });
