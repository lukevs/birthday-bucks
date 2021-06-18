import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "@ethersproject/bignumber";

import { SpencePence } from "../typechain";

const SPENCERS_BIRTHDAY_UTC = 675921600;
const SECONDS_PER_YEAR = 31557600;

async function timeTravelTo(utcSeconds: number) {
  await ethers.provider.send("evm_setNextBlockTimestamp", [utcSeconds]);
  await ethers.provider.send("evm_mine", []);
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

    async function asPence(amount: number) {
      return BigNumber.from(10)
        .pow(await spencePence.decimals())
        .mul(amount);
    }

    async function expectBalance(account: SignerWithAddress, amount: BigNumber) {
      const actualAmount = await spencePence.balanceOf(account.address);
      expect(actualAmount).to.equal(amount);
    }

    async function expectBirthdayBoyBalance(amountExcludingSupply: BigNumber) {
      await expectBalance(birthdayBoy, await (await spencePence.totalSupply()).add(amountExcludingSupply));
    }

    beforeEach(async function () {
      const SpencePenceContract = await ethers.getContractFactory("SpencePence");
      spencePence = await SpencePenceContract.deploy(birthdayBoy.address);
    });

    it("should give the birthday boy the full supply on deploy", async function () {
      const latestBlockNumber = await ethers.provider.getBlockNumber();
      const latestBlockTimestamp = (await ethers.provider.getBlock(latestBlockNumber)).timestamp;
      const spencersAgeSeconds = latestBlockTimestamp - SPENCERS_BIRTHDAY_UTC;

      const expectedInitialSupply = (await asPence(1)).mul(spencersAgeSeconds).div(SECONDS_PER_YEAR);

      const actualInitialSupply = await spencePence.balanceOf(birthdayBoy.address);

      expect(actualInitialSupply).to.equal(expectedInitialSupply);
      expect(actualInitialSupply).to.equal(await spencePence.totalSupply());
    });

    it("should support transfers back and forth", async function () {
      let birthdayBoyBalanceExcludingSupply: BigNumber = BigNumber.from(0);
      let notBirthdayBoyBalance: BigNumber = BigNumber.from(0);

      await expectBirthdayBoyBalance(birthdayBoyBalanceExcludingSupply);
      await expectBalance(notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenAway = await asPence(15);
      await spencePence.connect(birthdayBoy).transfer(notBirthdayBoy.address, amountGivenAway);

      birthdayBoyBalanceExcludingSupply = birthdayBoyBalanceExcludingSupply.sub(amountGivenAway);
      notBirthdayBoyBalance = notBirthdayBoyBalance.add(amountGivenAway);

      await expectBirthdayBoyBalance(birthdayBoyBalanceExcludingSupply);
      await expectBalance(notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenBack = await asPence(10);
      await spencePence.connect(notBirthdayBoy).transfer(birthdayBoy.address, amountGivenBack);

      birthdayBoyBalanceExcludingSupply = birthdayBoyBalanceExcludingSupply.add(amountGivenBack);
      notBirthdayBoyBalance = notBirthdayBoyBalance.sub(amountGivenBack);

      await expectBirthdayBoyBalance(birthdayBoyBalanceExcludingSupply);
      await expectBalance(notBirthdayBoy, notBirthdayBoyBalance);

      const amountGivenAwayAgain = await asPence(20);
      await spencePence.connect(birthdayBoy).transfer(notBirthdayBoy.address, amountGivenAwayAgain);

      birthdayBoyBalanceExcludingSupply = birthdayBoyBalanceExcludingSupply.sub(amountGivenAwayAgain);
      notBirthdayBoyBalance = notBirthdayBoyBalance.add(amountGivenAwayAgain);

      await expectBirthdayBoyBalance(birthdayBoyBalanceExcludingSupply);
      await expectBalance(notBirthdayBoy, notBirthdayBoyBalance);
    });

    /**
     * Tests todo
     * - test allowance
     * - test that no one can transfer more than their balance
     * - test that supply increases with spencer's age
     */
  });
});
