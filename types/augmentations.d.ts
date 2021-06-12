// eslint-disable @typescript-eslint/no-explicit-any
import { Fixture } from "ethereum-waffle";

import { Signers } from "./";
import { SpencePence } from "../typechain/";

declare module "mocha" {
  export interface Context {
    spencePence: SpencePence;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}
