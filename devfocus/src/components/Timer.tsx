import StartButton from "@/components/StartButton";
import PauseButton from "@/components/PauseButton";


const Timer = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-4xl font-bold mb-8">Dev Focus Timer</h1>
			<div className="text-6xl font-mono mb-8">40:00</div>
			<div className="space-x-4">
				<StartButton />
				<PauseButton />
			</div>
		</div>
	);
}

export default Timer;
