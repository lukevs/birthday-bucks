import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "@ethersproject/bignumber";

import { SpencePence } from "../typechain";

const SPENCERS_BIRTHDAY_UTC = 675921600;
const SECONDS_PER_YEAR = 31557600;

async function expectHasPence(spencePence: SpencePence, account: SignerWithAddress, amount: BigNumber) {
  const actualAmount = await spencePence.balanceOf(account.address);
  expect(actualAmount).to.equal(amount);
}

async function timeTravelTo(utcSeconds: number) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [utcSeconds]);
  await ethers.provider.send("evm_mine", []);
}

async function asPence(amount: number, spencePence: SpencePence) {
  return BigNumber.from(10)
    .pow(await spencePence.decimals())
    .mul(amount);
}

describe("Unit tests", function () {
  let birthdayBoy: SignerWithAddress;
  let notBirthdayBoy: SignerWithAddress;

  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    birthdayBoy = signers[1];
    notBirthdayBoy = signers[2];
  });

  describe("SpencePence", function () {
    let spencePence: SpencePence;

    beforeEach(async function () {
      const SpencePenceContract = await ethers.getContractFactory("SpencePence");
      spencePence = await SpencePenceContract.deploy(birthdayBoy.address);
    });

    it("should give the birthday boy the full supply on deploy", async function () {
      const latestBlockNumber = await ethers.provider.getBlockNumber();
      const latestBlockTimestamp = (await ethers.provider.getBlock(latestBlockNumber)).timestamp;
      const spencersAgeSeconds = latestBlockTimestamp - SPENCERS_BIRTHDAY_UTC;

      const expectedInitialSupply = (await asPence(1, spencePence)).mul(spencersAgeSeconds).div(SECONDS_PER_YEAR);

      const actualInitialSupply = await spencePence.balanceOf(birthdayBoy.address);

      expect(actualInitialSupply).to.equal(expectedInitialSupply);
      expect(actualInitialSupply).to.equal(await spencePence.totalSupply());
    });

    it("should support transfers back and forth", async function () {
      let birthdayBoyBalance: BigNumber = await spencePence.totalSupply();
      let notBirthdayBoyBalance: BigNumber = BigNumber.from(0);

      await expectHasPence(spencePence, birthdayBoy, birthdayBoyBalance);
      await expectHasPence(spencePence, notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenAway = await asPence(15, spencePence);
      await spencePence.connect(birthdayBoy).transfer(notBirthdayBoy.address, amountGivenAway);

      birthdayBoyBalance = (await spencePence.totalSupply()).sub(amountGivenAway);
      notBirthdayBoyBalance = amountGivenAway;

      await expectHasPence(spencePence, birthdayBoy, birthdayBoyBalance);
      await expectHasPence(spencePence, notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenBack = await asPence(10, spencePence);
      await spencePence.connect(notBirthdayBoy).transfer(birthdayBoy.address, amountGivenBack);

      birthdayBoyBalance = (await spencePence.totalSupply()).sub(amountGivenAway).add(amountGivenBack);
      notBirthdayBoyBalance = amountGivenAway.sub(amountGivenBack);

      await expectHasPence(spencePence, birthdayBoy, birthdayBoyBalance);
      await expectHasPence(spencePence, notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenAwayAgain = await asPence(20, spencePence);
      await spencePence.connect(birthdayBoy).transfer(notBirthdayBoy.address, amountGivenAwayAgain);

      birthdayBoyBalance = (await spencePence.totalSupply())
        .sub(amountGivenAway)
        .add(amountGivenBack)
        .sub(amountGivenAwayAgain);
      notBirthdayBoyBalance = amountGivenAway.sub(amountGivenBack).add(amountGivenAwayAgain);

      await expectHasPence(spencePence, birthdayBoy, birthdayBoyBalance);
      await expectHasPence(spencePence, notBirthdayBoy, notBirthdayBoyBalance);
    });
  });
});
