const main = async () => {
	const FlowyContractFactory = await hre.ethers.getContractFactory("Flowy");
	const FlowyContract = await FlowyContractFactory.deploy(
		"0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649", // Connext on Goerli
		"0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1", // TEST on Goerli
		"0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF" // TEST on Optimism Goerli
	);
	await FlowyContract.deployed();
	console.log("Goerli Network -- contract deployed to: ", FlowyContract.address);
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
