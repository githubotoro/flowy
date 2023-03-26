import { cx, cva } from "class-variance-authority";
import { motion } from "framer-motion";

export const Button = ({ cta, onClick, props }) => {
	const classes = cva(
		"cursor-pointer group outline-none focus:outline-none shadow-sm py-[4px] px-[12px] text-isLabelDarkPrimary font-bold font-sans",
		{
			variants: {
				size: {
					default: "text-xl font-black",
				},
				color: {
					dark: "bg-isSystemDarkTertiary",
					light: "bg-isSystemLightSecondary text-isLabelLightPrimary hover:bg-isSystemDarkTertiary",
					green: "bg-isGreenDark hover:bg-isGreenLightEmphasis",
					cyan: "bg-isCyanDark hover:bg-isCyanLightEmphasis",
					blue: "bg-isBlueDark hover:bg-isBlueLightEmphasis",
					indigo: "bg-isIndgioDark hover:bg-isIndgioLightEmphasis",
					purple: "bg-isPurpleDark hover:bg-isPurpleLightEmphasis",
					pink: "bg-isPinkDark hover:bg-isPinkLightEmphasis",
					red: "bg-isRedDark hover:bg-isRedLightEmphasis",
					orange: "bg-isOrangeDark hover:bg-isOrangeLightEmphasis",
					yellow: "bg-isYellowDark hover:bg-isYellowLightEmphasis",
					none: "",
				},
				hover: {
					default: "hover:text-isWhite hover:shadow-md",
					none: "",
				},
				rounded: {
					xl: "rounded-lg",
				},
				animate: {
					default: "transition-all duration-300 ease-in-out",
					none: "",
				},
			},
			defaultVariants: {
				size: "default",
				color: "blue",
				hover: "default",
				rounded: "xl",
				animate: "default",
			},
		}
	);

	return (
		<motion.button
			whileTap={{ scale: 0.5 }}
			onClick={onClick}
			className={cx(classes({ ...props }))}
		>
			{cta}
		</motion.button>
	);
};
