import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

import { SpencePence } from "../typechain";

async function sendSupplyToBirthdayBoy(spencePence: SpencePence, admin: SignerWithAddress) {
  const ownerBalance = await spencePence.balanceOf(admin.address);
  const birthdayBoy = await spencePence.birthdayBoy();
  await spencePence.transfer(birthdayBoy, ownerBalance);
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

    it("should set the birthday boy if owner", async function () {
      await spencePence.connect(admin).setBirthdayBoy(birthdayBoy.address);
      expect(await spencePence.birthdayBoy()).to.equal(birthdayBoy.address);
    });

    // it("should fail to set the birthday boy if zero address", async function () {
    //   await expect(spencePence.connect(admin).setBirthdayBoy(0)).to.be.revertedWith("SpencePence: Invalid birthday boy address")
    // });

    it("should fail to set the birthday boy if not the owner", async function () {
      await expect(spencePence.connect(birthdayBoy).setBirthdayBoy(birthdayBoy.address)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("should inflate relative to Spence's age", async function () {
      await spencePence.connect(admin).setBirthdayBoy(birthdayBoy.address);
      await sendSupplyToBirthdayBoy(spencePence, admin);

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
      await spencePence.connect(admin).setBirthdayBoy(birthdayBoy.address);
      await sendSupplyToBirthdayBoy(spencePence, admin);
      await expect(spencePence.connect(notBirthdayBoy).claimInflation()).to.be.revertedWith(
        "SpencePence: Caller is not the birthday boy",
      );
    });
  });
});
