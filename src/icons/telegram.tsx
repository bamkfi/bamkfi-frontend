import React, { FC, ReactElement, MouseEvent } from 'react'

const TelegramIcon: FC<{
	className?: string
	width?: number
	height?: number
	onClick?: (evt: MouseEvent) => void
}> = (props): ReactElement => {
	return (
		<svg
			onClick={props.onClick}
			viewBox="0 0 32 32"
			fill="none"
			className={props.className}
			width={props.width}
			height={props.height}
		>
			<title>Telegram</title>
			<path d="m29.919 6.163-4.225 19.925c-.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744-3.106 2.988c-.344.344-.631.631-1.294.631l.463-6.556 11.931-10.781c.519-.462-.113-.719-.806-.256l-14.75 9.288-6.35-1.988c-1.381-.431-1.406-1.381.288-2.044l24.837-9.569c1.15-.431 2.156.256 1.781 2.013z"></path>
		</svg>
	)
}

export default TelegramIcon
