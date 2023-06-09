const main = async () => {
	const FlowyContractFactory = await hre.ethers.getContractFactory("Flowy");
	const FlowyContract = await FlowyContractFactory.deploy(
		"0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649", // Connext on Goerli
		"0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1", // TEST on Goerli
		"0xeDb95D8037f769B72AAab41deeC92903A98C9E16", // TEST on Mumbai
		"0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa" // Push on Goerli
	);
	await FlowyContract.deployed();
	console.log(
		"Goerli Network -- contract deployed to: ",
		FlowyContract.address
	);
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
