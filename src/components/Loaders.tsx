
import { FC } from 'react'
import { Grid, GridProps, Oval, OvalProps } from 'react-loader-spinner'

export const GridSpinner: FC<GridProps & { color: string }> = props => (
	<Grid
		visible={true}
		height="20"
		width="20"
		ariaLabel="loading"
		radius="12"
		wrapperStyle={{}}
		wrapperClass="grid-wrapper"
		{...props}
	/>
)

export const OvalSpinner: FC<OvalProps & { color: string }> = props => (
	<Oval
		visible={true}
		height="26"
		width="26"
		strokeWidth={3}
		ariaLabel="loading"
		wrapperStyle={{}}
		wrapperClass=""
		{...props}
		color="white"
		secondaryColor='transparent'
	/>
)