require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.17",
	networks: {
		mumbai: {
			url: process.env.ALCHEMY_MUMBAI_URL,
			accounts: [process.env.PRIVATE_KEY],
		},
		goerli: {
			url: process.env.ALCHEMY_GOERLI_URL,
			accounts: [process.env.PRIVATE_KEY],
		},
		optimism: {
			url: process.env.ALCHEMY_OPTIMISM_URL,
			accounts: [process.env.PRIVATE_KEY],
		},
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
};
