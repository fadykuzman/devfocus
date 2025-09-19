import { fireEvent, render, screen } from '@testing-library/react';
import PlayPauseButton from '../PlayPauseButton';

describe('PlayPauseButton', () => {
	it('should show correct text when not Active', () => {
		const mockToggle = vi.fn();
		render(<PlayPauseButton isActive={false} onToggle={mockToggle} />);
		const button = screen.getByTestId('play-pause-button');
		expect(button).toHaveTextContent('Play');
	});

	it('should show correct text when Active', () => {
		const mockToggle = vi.fn();
		render(<PlayPauseButton isActive={true} onToggle={mockToggle} />);
		const button = screen.getByTestId('play-pause-button');
		expect(button).toHaveTextContent('Pause');
	});

	it('should calls onToggle when clicked', () => {
		const mockToggle = vi.fn();
		render(<PlayPauseButton isActive={true} onToggle={mockToggle} />);
		const button = screen.getByTestId('play-pause-button');
		fireEvent.click(button);
		expect(mockToggle).toHaveBeenCalledOnce();
	});

	it('should have accessible attributes', () => {
		const mockToggle = vi.fn();
		render(<PlayPauseButton isActive={true} onToggle={mockToggle} />);
		const button = screen.getByTestId('play-pause-button');
		expect(button).toHaveAccessibleName('Pause Timer');
		expect(button).toHaveRole('button');
	});

})
