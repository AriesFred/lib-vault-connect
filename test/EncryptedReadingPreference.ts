import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedReadingPreference, EncryptedReadingPreference__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedReadingPreference")) as EncryptedReadingPreference__factory;
  const contract = (await factory.deploy()) as EncryptedReadingPreference;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedReadingPreference", function () {
  let signers: Signers;
  let contract: EncryptedReadingPreference;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("encrypted count should be uninitialized after deployment", async function () {
    const encryptedCount = await contract.getEncryptedCategoryCount(signers.alice.address, 1);
    // Expect initial count to be bytes32(0) after deployment
    expect(encryptedCount).to.eq(ethers.ZeroHash);
  });

  it("should provide preference statistics for comprehensive user analytics", async function () {
    const categoryId1 = 1;
    const categoryId2 = 2;
    const clearCount1 = 5;
    const clearCount2 = 3;

    // Add preferences for two categories
    const encryptedCount1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount1)
      .encrypt();

    const encryptedCount2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount2)
      .encrypt();

    await contract.connect(signers.alice).addCategoryPreference(categoryId1, encryptedCount1.handles[0], encryptedCount1.inputProof);
    await contract.connect(signers.alice).addCategoryPreference(categoryId2, encryptedCount2.handles[0], encryptedCount2.inputProof);

    const [totalCategories, totalPreferences, averagePreferences] = await contract.getPreferenceStatistics(signers.alice.address);
    expect(totalCategories).to.equal(2);

    // Verify total and average calculations (encrypted values)
    expect(totalPreferences).to.not.eq(ethers.ZeroHash);
    expect(averagePreferences).to.not.eq(ethers.ZeroHash);
  });

  it("should support batch preference addition for multiple categories", async function () {
    const categoryIds = [1, 2, 3];
    const clearCounts = [2, 4, 6];

    // Create encrypted inputs for batch
    const encryptedInputs = [];
    for (const count of clearCounts) {
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(count)
        .encrypt();
      encryptedInputs.push(encryptedInput);
    }

    // Batch add preferences
    await contract.connect(signers.alice).batchAddPreferences(
      categoryIds,
      encryptedInputs.map(e => e.handles[0]),
      encryptedInputs[0].inputProof // Use first proof for simplicity
    );

    const userCategories = await contract.getUserCategories(signers.alice.address);
    expect(userCategories.length).to.equal(3);
  });

  it("should validate batch size limits for gas efficiency", async function () {
    // Create 11 categories (exceeds limit)
    const categoryIds = Array(11).fill(null).map((_, i) => i + 1);
    const clearCounts = Array(11).fill(2);

    // Create encrypted inputs for batch
    const encryptedInputs = [];
    for (const count of clearCounts) {
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(count)
        .encrypt();
      encryptedInputs.push(encryptedInput);
    }

    // Should reject batch larger than 10
    await expect(
      contract.connect(signers.alice).batchAddPreferences(
        categoryIds,
        encryptedInputs.map(e => e.handles[0]),
        encryptedInputs[0].inputProof
      )
    ).to.be.revertedWith("Batch size limited to 10 preferences for gas efficiency");
  });

  it("should return correct contract version", async function () {
    const version = await contract.version();
    expect(version).to.equal("1.0.0");
  });

  it("add preference for category 1 (Science Fiction)", async function () {
    const categoryId = 1;
    const clearCount = 1;

    // Encrypt count as a euint32
    const encryptedCount = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId, encryptedCount.handles[0], encryptedCount.inputProof);
    await tx.wait();

    // Check if initialized
    const hasInit = await contract.hasInitialized(signers.alice.address, categoryId);
    expect(hasInit).to.be.true;

    // Get encrypted count
    const encryptedCategoryCount = await contract.getEncryptedCategoryCount(signers.alice.address, categoryId);
    
    // Decrypt to verify
    const clearCategoryCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCategoryCount,
      contractAddress,
      signers.alice,
    );

    expect(clearCategoryCount).to.eq(clearCount);
  });

  it("increment preference count for same category", async function () {
    const categoryId = 1;
    const clearCount1 = 1;
    const clearCount2 = 2;

    // First addition
    const encryptedCount1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount1)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId, encryptedCount1.handles[0], encryptedCount1.inputProof);
    await tx.wait();

    // Second addition
    const encryptedCount2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount2)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId, encryptedCount2.handles[0], encryptedCount2.inputProof);
    await tx.wait();

    // Get encrypted count
    const encryptedCategoryCount = await contract.getEncryptedCategoryCount(signers.alice.address, categoryId);
    
    // Decrypt to verify (should be 1 + 2 = 3)
    const clearCategoryCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCategoryCount,
      contractAddress,
      signers.alice,
    );

    expect(clearCategoryCount).to.eq(clearCount1 + clearCount2);
  });

  it("add preferences for multiple categories", async function () {
    const categoryId1 = 1; // Science Fiction
    const categoryId2 = 2; // Mystery
    const clearCount = 1;

    // Add preference for category 1
    const encryptedCount1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId1, encryptedCount1.handles[0], encryptedCount1.inputProof);
    await tx.wait();

    // Add preference for category 2
    const encryptedCount2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId2, encryptedCount2.handles[0], encryptedCount2.inputProof);
    await tx.wait();

    // Check both categories exist
    const hasInit1 = await contract.hasInitialized(signers.alice.address, categoryId1);
    const hasInit2 = await contract.hasInitialized(signers.alice.address, categoryId2);
    
    expect(hasInit1).to.be.true;
    expect(hasInit2).to.be.true;

    // Get user categories
    const userCategories = await contract.getUserCategories(signers.alice.address);
    expect(userCategories.length).to.eq(2);
    expect(userCategories).to.include(categoryId1);
    expect(userCategories).to.include(categoryId2);
  });

  it("different users have separate preferences", async function () {
    const categoryId = 1;
    const clearCount = 1;

    // Alice adds preference
    const encryptedCountAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId, encryptedCountAlice.handles[0], encryptedCountAlice.inputProof);
    await tx.wait();

    // Bob adds preference
    const encryptedCountBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add32(clearCount)
      .encrypt();

    tx = await contract
      .connect(signers.bob)
      .addCategoryPreference(categoryId, encryptedCountBob.handles[0], encryptedCountBob.inputProof);
    await tx.wait();

    // Both should have initialized
    const hasInitAlice = await contract.hasInitialized(signers.alice.address, categoryId);
    const hasInitBob = await contract.hasInitialized(signers.bob.address, categoryId);
    
    expect(hasInitAlice).to.be.true;
    expect(hasInitBob).to.be.true;

    // Both should have count of 1
    const encryptedCountAliceResult = await contract.getEncryptedCategoryCount(signers.alice.address, categoryId);
    const encryptedCountBobResult = await contract.getEncryptedCategoryCount(signers.bob.address, categoryId);
    
    const clearCountAlice = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCountAliceResult,
      contractAddress,
      signers.alice,
    );

    const clearCountBob = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCountBobResult,
      contractAddress,
      signers.bob,
    );

    expect(clearCountAlice).to.eq(clearCount);
    expect(clearCountBob).to.eq(clearCount);
  });
});

