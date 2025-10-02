import { Meta, StoryObj } from '@storybook/nextjs-vite';
import TimerDisplay from '../TimerDisplay'

const meta: Meta<typeof TimerDisplay> = {
	title: 'Components/TimerDisplay',
	component: TimerDisplay,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		timeRemainingInSeconds: 2400,
	},

};
