import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

import { SpencerPence } from "../typechain";

async function setBirthdayBoy(spencerPence: SpencerPence, admin: SignerWithAddress, birthdayBoy: SignerWithAddress) {
  const ownerBalance = await spencerPence.balanceOf(admin.address);
  await spencerPence.connect(admin).approve(birthdayBoy.address, ownerBalance);
  await spencerPence.connect(birthdayBoy).imTheBirthdayBoy();
}

async function expectHasPence(spencerPence: SpencerPence, account: SignerWithAddress, amount: number) {
  const expectedAmount = ethers.BigNumber.from(10)
    .pow(await spencerPence.decimals())
    .mul(amount);
  const actualAmount = await spencerPence.balanceOf(account.address);
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

  describe("SpencerPence", function () {
    let spencerPence: SpencerPence;

    beforeEach(async function () {
      const SpencerPenceContract = await ethers.getContractFactory("SpencerPence");
      spencerPence = await SpencerPenceContract.deploy();
    });

    it("should assign admin as owner and mint initial supply to owner", async function () {
      expect(await spencerPence.connect(admin).owner()).to.equal(admin.address);

      const decimals = await spencerPence.decimals();
      const expectedInitialSupply = ethers.BigNumber.from(10).pow(decimals).mul(30);
      const actualInitialSupply = await spencerPence.balanceOf(admin.address);

      expect(actualInitialSupply).to.equal(expectedInitialSupply);
      expect(actualInitialSupply).to.equal(await spencerPence.totalSupply());
    });

    it("should make the caller the birthday boy if approved", async function () {
      await setBirthdayBoy(spencerPence, admin, birthdayBoy);
      expect(await spencerPence.birthdayBoy()).to.equal(birthdayBoy.address);
      expect(await spencerPence.balanceOf(admin.address)).to.equal(0);
      expect(await spencerPence.balanceOf(birthdayBoy.address)).to.equal(await spencerPence.totalSupply());
    });

    it("should fail to set the birthday boy if already set", async function () {
      await setBirthdayBoy(spencerPence, admin, birthdayBoy);
      await expect(setBirthdayBoy(spencerPence, admin, notBirthdayBoy)).to.be.revertedWith(
        "SpencerPence: We already have a birthday boy",
      );
    });

    it("should fail to make the caller the birthday boy if not approved", async function () {
      await expect(spencerPence.connect(notBirthdayBoy).imTheBirthdayBoy()).to.be.revertedWith(
        "ERC20: transfer amount exceeds allowance",
      );
    });

    it("should inflate relative to Spencer's age", async function () {
      await setBirthdayBoy(spencerPence, admin, birthdayBoy);

      const spencers30thBirthdayUtcSeconds = 1622692800;
      const oneYearSeconds = 31557600;

      const spencers32ndBirthdayUtcSeconds = spencers30thBirthdayUtcSeconds + oneYearSeconds * 2;
      await timeTravelTo(spencers32ndBirthdayUtcSeconds);

      await expectHasPence(spencerPence, birthdayBoy, 30);
      await spencerPence.connect(birthdayBoy).claimInflation();
      await expectHasPence(spencerPence, birthdayBoy, 32);
    });

    it("should not allow claiming inflation without a birthday boy", async function () {
      await expect(spencerPence.connect(birthdayBoy).claimInflation()).to.be.revertedWith(
        "SpencerPence: No birthday boy is set",
      );
    });

    it("should only allow claiming inflation by the birthday boy", async function () {
      await setBirthdayBoy(spencerPence, admin, birthdayBoy);
      await expect(spencerPence.connect(notBirthdayBoy).claimInflation()).to.be.revertedWith(
        "SpencerPence: Caller is not the birthday boy",
      );
    });
  });
});
