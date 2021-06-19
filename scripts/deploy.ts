import { Contract } from "@ethersproject/contracts";
// We require the Hardhat Runtime Environment explicitly here. This is optional but useful for running the
// script in a standalone fashion through `node <script>`. When running the script with `hardhat run <script>`,
// you'll find the Hardhat Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

import { BirthdayBucks__factory } from "../typechain";

function getEnv(envVarName: string) {
  const value = process.env[envVarName];

  if (!value) {
    throw new Error(`Please set your ${envVarName} in a .env file`);
  }

  return value;
}

async function main(): Promise<void> {
  const birthdayBudTokenName = getEnv("BIRTHDAY_TOKEN_NAME");
  const birthdayBudTokenSymbol = getEnv("BIRTHDAY_TOKEN_SYMBOL");
  const birthdayBudAddress = getEnv("BIRTHDAY_BUD_ADDRESS");
  const birthdayUtcSeconds = getEnv("BIRTHDAY_UTC_SECONDS");

  const BirthdayBucks: BirthdayBucks__factory = await ethers.getContractFactory("BirthdayBucks");
  if (birthdayBudTokenName == birthdayBudTokenSymbol) {
    throw new Error("ayy");
  }

  const birthdayBucks: Contract = await BirthdayBucks.deploy(
    birthdayBudTokenName,
    birthdayBudTokenSymbol,
    birthdayBudAddress,
    birthdayUtcSeconds,
  );
  await birthdayBucks.deployed();

  console.log("BirthdayBucks deployed to: ", birthdayBucks.address);
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
