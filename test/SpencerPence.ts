import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

import { Signers } from "../types";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.birthdayBoy = signers[1];
    this.signers.notBirthdayBoy = signers[2];
  });

  describe("SpencerPence", function () {
    beforeEach(async function () {
      const SpencerPence = await ethers.getContractFactory("SpencerPence");
      this.spencerPence = await SpencerPence.deploy();
    });

    it("should assign admin as owner and mint initial supply to owner", async function () {
      expect(await this.spencerPence.connect(this.signers.admin).owner()).to.equal(this.signers.admin.address);

      const decimals = await this.spencerPence.decimals();
      const expectedInitialSupply = ethers.BigNumber.from(10).pow(decimals).mul(29);
      const actualInitialSupply = await this.spencerPence.balanceOf(this.signers.admin.address);

      expect(actualInitialSupply).to.equal(expectedInitialSupply);
      expect(actualInitialSupply).to.equal(await this.spencerPence.totalSupply());
    });
  });
});
