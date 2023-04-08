const { ethers } = require("ethers");
const { Provider, zksync, Wallet } = require("zksync-web3");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const { utils } = require("zksync-web3");
const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const WETH_ADDRESS = "0x20b28B1e4665FFf290650586ad76E977EAb90c5D";
const DAI_ADDRESS = "0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b";
const DAI_DECIMALS = 18;
const POOL_ADDRESS = "0xe52940eDDa6ec5FDabef7C33B9C1E1d613BbA144"; // ETH/DAI
const VAULT_CONTRACT_ADDRESS = "0x4Ff94F499E1E69D687f3C3cE2CE93E717a0769F8";
const ROUTER_ADDRESS = "0xB3b7fCbb8Db37bC6f572634299A58f51622A847e";
const POOLFACTORY_ADDRESS = "0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006"; // Classic
const ADDRESS_ZERO = ethers.constants.AddressZero;

async function main() {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const provider = new Provider("https://zksync2-testnet.zksync.dev");
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const deployer = new Deployer(hre, wallet);

  // Initialise contract instance

  const factoryArtifact = await deployer.loadArtifact("AAFactory");
  const aaArtifact = await deployer.loadArtifact("Account");
  const AAFactoryAddress = "0x283E913Ad9cC322D350b88F3BB20dd46dc863585";

  const aaFactory = new ethers.Contract(
    AAFactoryAddress,
    factoryArtifact.abi,
    wallet
  );
  const salt = ethers.constants.HashZero;
  const owner = new Wallet(
    "0x059de84d43344d80276ea50862d1f3208bca6c47d2a45b2bb5c022d139ea1098",
    provider
  );

  /*   const tx = await aaFactory.deployAccount(salt, wallet.address, {
    gasLimit: 1000000,
  }); 

  await tx.wait();  */

  // const owner = await wallet?.getAddress();
  // const salt = ethers.constants.HashZero;

  console.log("OWNER", owner.address);

  const abiCoder = new ethers.utils.AbiCoder();
  const accountAddress = utils.create2Address(
    AAFactoryAddress,
    await aaFactory.aaBytecodeHash(),
    salt,
    abiCoder.encode(["address"], [owner.address])
  );
  //0x3861BeF4B47Bc967aD708A5E7cA36B499D422672

  console.log(`Account deployed on address ${accountAddress}`);
  await (
    await wallet.sendTransaction({
      to: accountAddress,
      value: ethers.utils.parseEther("0.01"),
    })
  ).wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
