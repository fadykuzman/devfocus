import { Meta, StoryObj } from '@storybook/nextjs-vite';
import Timer from '../Timer'


const meta: Meta<typeof Timer> = {
	title: 'Components/Timer',
	component: Timer,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
