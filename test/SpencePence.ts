import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

import { SpencePence } from "../typechain";

async function setBirthdayBoy(spencePence: SpencePence, admin: SignerWithAddress, birthdayBoy: SignerWithAddress) {
  const ownerBalance = await spencePence.balanceOf(admin.address);
  await spencePence.connect(admin).approve(birthdayBoy.address, ownerBalance);
  await spencePence.connect(birthdayBoy).imTheBirthdayBoy();
}

async function expectHasPence(spencePence: SpencePence, account: SignerWithAddress, amount: number) {
  const expectedAmount = ethers.BigNumber.from(10)
    .pow(await spencePence.decimals())
    .mul(amount);
  const actualAmount = await spencePence.balanceOf(account.address);
  expect(actualAmount).to.equal(expectedAmount);
}

async function timeTravelTo(utcSeconds: number) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [utcSeconds]);
  await ethers.provider.send("evm_mine", []);
}

describe("Unit tests", function () {
  let admin: SignerWithAddress;
  let birthdayBoy: SignerWithAddress;
  let notBirthdayBoy: SignerWithAddress;

  before(async function () {
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    admin = signers[0];
    birthdayBoy = signers[1];
    notBirthdayBoy = signers[2];
  });

  describe("SpencePence", function () {
    let spencePence: SpencePence;

    beforeEach(async function () {
      const SpencePenceContract = await ethers.getContractFactory("SpencePence");
      spencePence = await SpencePenceContract.deploy();
    });

    it("should assign admin as owner and mint initial supply to owner", async function () {
      expect(await spencePence.connect(admin).owner()).to.equal(admin.address);

      const decimals = await spencePence.decimals();
      const expectedInitialSupply = ethers.BigNumber.from(10).pow(decimals).mul(30);
      const actualInitialSupply = await spencePence.balanceOf(admin.address);

      expect(actualInitialSupply).to.equal(expectedInitialSupply);
      expect(actualInitialSupply).to.equal(await spencePence.totalSupply());
    });

    it("should make the caller the birthday boy if approved", async function () {
      await setBirthdayBoy(spencePence, admin, birthdayBoy);
      expect(await spencePence.birthdayBoy()).to.equal(birthdayBoy.address);
      expect(await spencePence.balanceOf(admin.address)).to.equal(0);
      expect(await spencePence.balanceOf(birthdayBoy.address)).to.equal(await spencePence.totalSupply());
    });

    it("should fail to set the birthday boy if already set", async function () {
      await setBirthdayBoy(spencePence, admin, birthdayBoy);
      await expect(setBirthdayBoy(spencePence, admin, notBirthdayBoy)).to.be.revertedWith(
        "SpencePence: We already have a birthday boy",
      );
    });

    it("should fail to make the caller the birthday boy if not approved", async function () {
      await expect(spencePence.connect(notBirthdayBoy).imTheBirthdayBoy()).to.be.revertedWith(
        "ERC20: transfer amount exceeds allowance",
      );
    });

    it("should inflate relative to Spence's age", async function () {
      await setBirthdayBoy(spencePence, admin, birthdayBoy);

      const spences30thBirthdayUtcSeconds = 1622692800;
      const oneYearSeconds = 31557600;

      const spences32ndBirthdayUtcSeconds = spences30thBirthdayUtcSeconds + oneYearSeconds * 2;
      await timeTravelTo(spences32ndBirthdayUtcSeconds);

      await expectHasPence(spencePence, birthdayBoy, 30);
      await spencePence.connect(birthdayBoy).claimInflation();
      await expectHasPence(spencePence, birthdayBoy, 32);
    });

    it("should not allow claiming inflation without a birthday boy", async function () {
      await expect(spencePence.connect(birthdayBoy).claimInflation()).to.be.revertedWith(
        "SpencePence: No birthday boy is set",
      );
    });

    it("should only allow claiming inflation by the birthday boy", async function () {
      await setBirthdayBoy(spencePence, admin, birthdayBoy);
      await expect(spencePence.connect(notBirthdayBoy).claimInflation()).to.be.revertedWith(
        "SpencePence: Caller is not the birthday boy",
      );
    });
  });
});
