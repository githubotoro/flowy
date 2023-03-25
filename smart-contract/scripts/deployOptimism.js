const main = async () => {
	const FlowyContractFactory = await hre.ethers.getContractFactory("Flowy");
	const FlowyContract = await FlowyContractFactory.deploy(
		"0x5Ea1bb242326044699C3d81341c5f535d5Af1504", // Connext on Optimism
		"0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF", // TEST on Optimism Goerli
		"0xeDb95D8037f769B72AAab41deeC92903A98C9E16" // TEST on Mumbai
	);
	await FlowyContract.deployed();
	console.log("Optimism Network -- contract deployed to: ", FlowyContract.address);
};

const runMain = async () => {
	try {
		await main();
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

runMain();
