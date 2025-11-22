import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedReadingPreference } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedReadingPreferenceSepolia", function () {
  let signers: Signers;
  let contract: EncryptedReadingPreference;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const EncryptedReadingPreferenceDeployment = await deployments.get("EncryptedReadingPreference");
      contractAddress = EncryptedReadingPreferenceDeployment.address;
      contract = await ethers.getContractAt("EncryptedReadingPreference", EncryptedReadingPreferenceDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("add preference for category 1", async function () {
    steps = 10;
    this.timeout(4 * 40000);

    const categoryId = 1;
    const clearCount = 1;

    progress("Encrypting count...");
    const encryptedCount = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearCount)
      .encrypt();

    progress(
      `Call addCategoryPreference(${categoryId}) EncryptedReadingPreference=${contractAddress} handle=${ethers.hexlify(encryptedCount.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await contract
      .connect(signers.alice)
      .addCategoryPreference(categoryId, encryptedCount.handles[0], encryptedCount.inputProof);
    await tx.wait();

    progress(`Call EncryptedReadingPreference.getEncryptedCategoryCount()...`);
    const encryptedCategoryCount = await contract.getEncryptedCategoryCount(signers.alice.address, categoryId);
    expect(encryptedCategoryCount).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting EncryptedReadingPreference.getEncryptedCategoryCount()=${encryptedCategoryCount}...`);
    const clearCategoryCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCategoryCount,
      contractAddress,
      signers.alice,
    );
    progress(`Clear EncryptedReadingPreference.getEncryptedCategoryCount()=${clearCategoryCount}`);

    expect(clearCategoryCount).to.eq(clearCount);
  });
});

