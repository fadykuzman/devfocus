import TimerDisplay from "./TimerDisplay";


const Timer = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-4xl font-bold mb-8">Dev Focus Timer</h1>
			<TimerDisplay timeRemainingInSeconds={240}/>
			<div className="space-x-4">
			</div>
		</div>
	);
}

export default Timer;
