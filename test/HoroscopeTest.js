const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("horoscopeNFT", function () {
  let horoscopeNFT;
  let owner;
  let recipient;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();

    // Fund the owner account with 1 Ether
    await network.provider.send("hardhat_setBalance", [
      owner.address,
      "0x1000000000000000000000",
    ]);

    const horoscopeNFTContract = await ethers.getContractFactory(
      "horoscopeNFT"
    );
    horoscopeNFT = await horoscopeNFTContract.deploy();
    await horoscopeNFT.deployed();
  });

  it("Should mint an NFT with the correct zodiac sign", async function () {
    const zodiacSign = "Leo";
    const mintTx = await horoscopeNFT.mintNFT(recipient.address, zodiacSign);
    await mintTx.wait();

    const tokenUri = await horoscopeNFT.tokenURI(1);
    const json = JSON.parse(
      Buffer.from(tokenUri.split(",")[1], "base64").toString()
    );
    expect(json.name).to.equal(zodiacSign);
    expect(json.attributes[0].value).to.equal(zodiacSign);
  });

  it("Should increment the token ID correctly", async function () {
    const zodiacSign1 = "Leo";
    const zodiacSign2 = "Virgo";
    const mintTx1 = await horoscopeNFT.mintNFT(recipient.address, zodiacSign1);
    await mintTx1.wait();
    const mintTx2 = await horoscopeNFT.mintNFT(recipient.address, zodiacSign2);
    await mintTx2.wait();

    expect(await horoscopeNFT.tokenIds()).to.equal(2);
  });

  it("Should revert if the zodiac sign is empty", async function () {
    await expect(
      horoscopeNFT.mintNFT(recipient.address, "")
    ).to.be.revertedWith("Zodiac sign cannot be empty");
  });
});
