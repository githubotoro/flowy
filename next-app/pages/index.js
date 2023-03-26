import Head from "next/head";
import Image from "next/image";

import React, { useEffect, useState } from "react";
import abi from "../helpers/Flowy/Flowy.json";
import { ethers } from "ethers";

import { useContractRead } from "wagmi";
import { useAccount, useSigner } from "wagmi";
import { chain, chainId, useNetwork } from "wagmi";
import { CustomConnectWalletButton } from "@/components/CustomConnectWalletButton";

import * as PushAPI from "@pushprotocol/restapi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/Button";
import { cx } from "class-variance-authority";
import { Etherscan } from "@/components/etherscan";
import { Opensea } from "@/components/opensea";

const Home = () => {
	const FLOWY_ADDRESS_GOERLI = "0x6C7132d30167F39Ef6DA9287916d09A5962b8E51";
	const FLOWY_ADDRESS_MUMBAI = "0x0029754f88896E3FE639Dad25c1460223231F032";
	const FLOWY_ABI = abi.abi;

	const [event, setEvent] = useState(false);
	const { address, isConnected } = useAccount();
	const { data: signer } = useSigner();

	const [currAmount, setCurrAmount] = useState(0);
	const [goerliAmount, setGoerliAmount] = useState(0);

	const [streamDetails, setStreamDetails] = useState({
		status: "loading",
		streamReference: 0,
		streamAmount: 0,
		streamType: 0,
		streamMax: 0,
	});

	const goerliProvider = new ethers.providers.AlchemyProvider(
		"goerli",
		process.env.NEXT_PUBLIC_ALCHEMY_ID
	);
	const mumbaiProvider = new ethers.providers.AlchemyProvider(
		"maticmum",
		process.env.NEXT_PUBLIC_ALCHEMY_ID
	);
	const goerliSigner = new ethers.Wallet(
		process.env.NEXT_PUBLIC_PRIVATE_KEY,
		goerliProvider
	);
	const mumbaiSigner = new ethers.Wallet(
		process.env.NEXT_PUBLIC_PRIVATE_KEY,
		mumbaiProvider
	);
	const goerliContract = new ethers.Contract(
		FLOWY_ADDRESS_GOERLI,
		FLOWY_ABI,
		goerliSigner
	);
	const mumbaiContract = new ethers.Contract(
		FLOWY_ADDRESS_MUMBAI,
		FLOWY_ABI,
		mumbaiSigner
	);

	const nfts = {
		goerli: {
			color: "indigo",
			name: "Goerli",
			etherscan: `https://goerli.etherscan.io/address/${FLOWY_ADDRESS_GOERLI}`,
			opensea: `https://testnets.opensea.io/assets/goerli/${FLOWY_ADDRESS_GOERLI}/1`,
		},
		mumbai: {
			color: "purple",
			name: "Polygon Mumbai",
			etherscan: `https://mumbai.polygonscan.com/address/${FLOWY_ADDRESS_MUMBAI}`,
			opensea: `https://testnets.opensea.io/assets/mumbai/${FLOWY_ADDRESS_MUMBAI}/1`,
		},
	};

	const startStream = async () => {
		try {
			const Flowy = new ethers.Contract(
				FLOWY_ADDRESS_GOERLI,
				FLOWY_ABI,
				signer
			);
			const txn = await Flowy.xSend(
				FLOWY_ADDRESS_MUMBAI,
				9991,
				100,
				30000000000000000n,
				{
					value: 30000000000000000n,
				}
			);
			await txn.wait();
			setEvent(!event);
		} catch (err) {
			console.log(err);
		}
	};

	const stopStream = async () => {
		try {
			const Flowy = new ethers.Contract(
				FLOWY_ADDRESS_GOERLI,
				FLOWY_ABI,
				signer
			);
			const txn = await Flowy.xSend(
				FLOWY_ADDRESS_MUMBAI,
				9991,
				100,
				30000000000000000n,
				{
					value: 30000000000000000n,
				}
			);
			await txn.wait();
			setEvent(!event);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		const getStreamDetails = async () => {
			try {
				const _goerliAmount = await goerliContract.currAmount();
				setGoerliAmount(parseInt(_goerliAmount));
				setCurrAmount(parseInt(_goerliAmount));

				const _streamDetails = await goerliContract.getStreamDetails();
				setStreamDetails({
					status: "fetched",
					streamReference: parseInt(_streamDetails[0]),
					streamAmount: parseInt(_streamDetails[1]),
					streamType: parseInt(_streamDetails[2]),
					streamMax: parseInt(_streamDetails[3]),
				});
			} catch (err) {
				console.log(err);
			}
		};

		getStreamDetails();
	}, [event]);

	const getCurrAmount = () => {
		const currTimestamp = Math.floor(Date.now() / 1000);
		if (streamDetails.streamReference === 0) {
			return goerliAmount;
		} else {
			return currAmount;
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			if (streamDetails.streamReference === 0) {
				setCurrAmount(getCurrAmount());
			} else {
				setCurrAmount(getCurrAmount() + 1);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [currAmount, streamDetails]);

	const svgClasses =
		"bg-isSystemLightSecondary cursor-pointer shadow-sm rounded-lg py-1 px-2 hover:bg-isWhite transition-all duration-300 ease-in-out";

	const NFT = ({ id }) => {
		return (
			<div
				className={cx(
					"rounded-xl shadow-md font-mono tabular-nums leading-none bg-isSystemLightSecondary tracking-tighter flex flex-col items-center"
				)}
			>
				<Button
					cta={nfts[id].name}
					props={{
						color: nfts[id].color,
						className: "w-full py-2 text-2xl rounded-xl",
					}}
				/>

				<svg
					width="100%"
					height="100%"
					viewBox="0 0 200 200"
					xmlns="http://www.w3.org/2000/svg"
				>
					<text x="100" y="100" textAnchor="middle">
						&lt;
						{streamDetails.status === "loading"
							? streamDetails.status
							: id === "goerli"
							? currAmount
							: streamDetails.streamMax - currAmount}
						&gt;
					</text>
				</svg>

				<div className="grid items-center w-full grid-cols-2 gap-5 p-2 shadow-lg rounded-xl bg-isLabelLightSecondary">
					<a
						href={nfts[id].etherscan}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Etherscan classes={svgClasses} />
					</a>
					<a
						href={nfts[id].opensea}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Opensea classes={svgClasses} />
					</a>
				</div>
			</div>
		);
	};

	return (
		<>
			<Head>
				<title>Flowy</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="sticky top-0 z-50 flex flex-row items-center w-full place-content-center bg-isSystemDarkPrimary text-isGrayDarkEmphasis6 ">
				<div className="flex flex-row items-center justify-between w-full max-w-2xl px-2 py-2 my-3 shadow-sm bg-isSystemDarkSecondary rounded-xl ">
					<Button
						cta="Flowy"
						props={{
							color: "light",
							className: "text-isBlack",
						}}
					/>

					<CustomConnectWalletButton />
				</div>
			</div>

			<main className="flex flex-col items-center w-full min-h-screen p-3 font-sans place-content-start bg-isSystemDarkPrimary text-isLabelDarkSecondary">
				<div className="mt-6 text-4xl font-bold leading-none drop-shadow-md">
					<span className="mx-1 text-isWhite">Stream</span>
					<span className="mx-1 text-isBlueDark">NFTs</span>
					<span className="mx-1 text-isGreenDark">cross-chain</span>
				</div>
				<div className="pt-2 font-mono text-lg italic font-medium tracking-tighter">
					Flowy helps you stream NFT across chains in real-time @{" "}
					<span className="font-semibold text-isLabelDarkPrimary">
						1 click
					</span>
				</div>

				<div className="grid w-full max-w-lg grid-cols-2 gap-5 py-10">
					<NFT id="goerli" />
					<NFT id="mumbai" />
				</div>

				<div className="grid items-center w-full max-w-lg grid-cols-2 gap-5 pb-5">
					<Button
						onClick={async () => {
							startStream();
						}}
						cta="Start Stream"
						props={{
							color: "green",
							className: "w-full font-mono text-2xl rounded-xl",
						}}
					/>
					<Button
						onClick={async () => {
							stopStream();
						}}
						cta="Stop Stream"
						props={{
							color: "red",
							className: "w-full text-2xl rounded-xl",
						}}
					/>
				</div>
			</main>
		</>
	);
};

export default Home;
