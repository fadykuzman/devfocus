import { render, fireEvent, act, screen } from '@testing-library/react'
import ResetButton from '../ResetButton';

describe('Reset Button', () => {
	it('should show correct text', () => {
		const mockClick = vi.fn();
		render(<ResetButton onClick={mockClick}/>);
		expect(screen.getByTestId('reset-button')).toHaveTextContent('Reset');
	})

	it('should call onClick when clicked', () => {
		const mockClick = vi.fn();
		render(<ResetButton onClick={mockClick}/>);
		const button = screen.getByTestId('reset-button');

		fireEvent.click(button);

		expect(mockClick).toHaveBeenCalledOnce();
		
	});

	it('should contain accessability attributes', () => {
		const mockClick = vi.fn();
		render(<ResetButton onClick={mockClick}/>);
		const button = screen.getByTestId('reset-button');

		expect(button).toHaveRole('button');
		expect(button).toHaveAccessibleName('Reset Timer');

	});
})
