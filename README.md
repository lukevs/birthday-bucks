# BirthdayBucks 🎂
> The gift that keeps on giving 🥰

**BirthdayBucks** 🎂 implements an **ERC-20 token** that always has **as many tokens as a your friend has years**

Deploy the contract with...
- A name _(ex: SpencePence)_
- A symbol _(ex: SPNC)_
- Your birthday bud's wallet and birthday

...and all new supply will be minted to them 🎁

The token uses **rebasing**, so no transactions are required to collect new supply

## Deploy your own

### 1. Clone the repo

```sh
$ git clone https://github.com/lukevs/birthday-bucks; cd birthday-bucks
```

### 2. Install dependencies

```sh
$ yarn install
```

### 3. Setup .env

Create a `.env` file with the following values:
- **MNEMONIC** - secret words representing the private key of for your own wallet - you'll use this wallet to deploy the contract ([find on MetaMask](https://metamask.zendesk.com/hc/en-us/articles/360015290032-How-to-Reveal-Your-Seed-Phrase-Secret-Recovery-Phrase))
- **INFURA_API_KEY** - if you don't have an account, [register here](https://infura.io/register) - then [create a project for the token](https://infura.io/dashboard/ethereum) to get a key
- **BIRTHDAY_TOKEN_NAME** - The name of the token (ex: SpencePence, LukeLoot, DannyDoubloons)
- **BIRTHDAY_TOKEN_SYMBOL** - The symbol of the token (ex: SPNC, LOOT, DNYS)
- **BIRTHDAY_BUD_ADDRESS** - The birthday bud's wallet address - all current and future supply will be given to them
- **BIRTHDAY_UTC_SECONDS** - The birthday bud's moment of birth in UTC seconds ([UTC second calculator](https://www.epochconverter.com/))

Example `.env`:
```sh
MNEMONIC=birthday birthday birthday birthday birthday birthday birthday birthday birthday birthday birthday birthday
INFURA_API_KEY=abc123doremi
BIRTHDAY_TOKEN_NAME=SpencePence
BIRTHDAY_TOKEN_SYMBOL=SPNC
BIRTHDAY_BUD_ADDRESS= 0x1111111111111111111111111111111111111111
BIRTHDAY_UTC_SECONDS=600000000
```

### 4. Testnet deploy

To ensure all looks good, deploy to a testnet (we're using Ropsten)

If your account has no ETH on Ropsten, request it [here](https://faucet.ropsten.be/)

Deploy with:

```
yarn deploy:network ropsten
```

Review the deployed contract by searching the contract address on the [Ropsten etherscan](https://ropsten.etherscan.io/)


### 5. $$$

Ensure your wallet (the one tied to MNEMONIC) has enough money to deploy the contract

(~0.016 ETH at the time of writing)


### 6. Mainnet deploy

Deploy with:

```
yarn deploy:network mainnet
```

Again check that all went well on the [main etherscan](http://etherscan.io/)

### 7. 🥳

Celebrate with some cake! 🍰

## Live BirthdayBucks
- [SpencePence](https://etherscan.io/token/0x2164b848a27f4d51db4e9a7c349dabd54cf15e4d)

_PR to add your own 🎉_

## Contributing

Would love to see some PRs!

See the README for [paulrberg/solidity-template](https://github.com/paulrberg/solidity-template) to see all the tools available in this repo.
