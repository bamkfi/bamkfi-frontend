import React, { FC, ReactElement, MouseEvent } from 'react'

const NusdIcon: FC<{
	className?: string
	width?: number
	height?: number
	onClick?: (evt: MouseEvent) => void
}> = (props): ReactElement => {
	return (
		<svg
			onClick={props.onClick}
			className={props.className}
			width={props.width}
			height={props.height}
			viewBox="0 0 352 352"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M16 336V16L336 336V16"
				stroke="#F3E9DD"
				strokeWidth="32"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M92 216L220 88"
				stroke="#F3E9DD"
				strokeWidth="32"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M128 256L256 128"
				stroke="#F3E9DD"
				strokeWidth="32"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default NusdIcon
