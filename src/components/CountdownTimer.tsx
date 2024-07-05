import { useEffect, useState } from "react"

const CountdownTimer = ({ targetUnixTimestamp }: { targetUnixTimestamp: number }) => {
	const [timeLeft, setTimeLeft] = useState(targetUnixTimestamp - Math.floor(Date.now() / 1000))

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(prevTime => {
				const updatedTime = prevTime - 1
				if (updatedTime <= 0) {
					clearInterval(timer)
					return 0
				}
				return updatedTime
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = time % 60
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}

	return <span>{formatTime(timeLeft)}</span>
}

export default CountdownTimer
