const main = async () => {
	const FlowyContractFactory = await hre.ethers.getContractFactory("Flowy");
	const FlowyContract = await FlowyContractFactory.deploy(
		"0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a", // Connext on Mumbai
		"0xeDb95D8037f769B72AAab41deeC92903A98C9E16", // TEST on Mumbai
		"0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1", // TEST on Goerli
		"0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa" // Push on Mumabi
	);
	await FlowyContract.deployed();
	console.log(
		"Mumbai Network -- contract deployed to: ",
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
