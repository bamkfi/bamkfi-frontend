import React, { FC, ReactElement, MouseEvent } from 'react'

const TwitterIcon: FC<{
	className?: string
	width?: number
	height?: number
	onClick?: (evt: MouseEvent) => void
}> = (props): ReactElement => {
	return (
		<svg
			onClick={props.onClick}
			viewBox="0 0 24 24"
			fill="none"
			className={props.className}
			width={props.width}
			height={props.height}
		>
			<title>X (Twitter)</title>
			<path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z"></path>
		</svg>
	)
}

export default TwitterIcon
