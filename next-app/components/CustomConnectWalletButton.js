import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./Button";

export const CustomConnectWalletButton = () => {
	return (
		<ConnectButton.Custom>
			{({
				account,
				chain,
				openAccountModal,
				openChainModal,
				openConnectModal,
				authenticationStatus,
				mounted,
			}) => {
				const ready = mounted && authenticationStatus !== "loading";
				const connected =
					ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

				return (
					<div
						{...(!ready && {
							"aria-hidden": true,
							style: {
								opacity: 0,
								pointerEvents: "none",
								userSelect: "none",
							},
						})}
					>
						{(() => {
							if (!connected) {
								return <Button cta="Connect Wallet" onClick={openConnectModal} />;
							}

							if (chain.unsupported) {
								return (
									<Button cta="Wrong Network!" onClick={openChainModal} props={{ color: "red" }} />
								);
							}

							return (
								<div className="flex flex-row items-center space-x-2">
									<Button
										cta={chain.name}
										onClick={openChainModal}
										props={{
											color: "orange",
											className: "flex flex-row items-center",
										}}
									/>

									<Button
										cta={`${account.displayName} ${
											account.displayBalance ? ` (${account.displayBalance})` : ""
										}`}
										onClick={openAccountModal}
										props={{
											color: "blue",
											className: "flex flex-row items-center",
										}}
									/>
								</div>
							);
						})()}
					</div>
				);
			}}
		</ConnectButton.Custom>
	);
};
