import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

const TestConsumer = () => {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast({ message: 'Duplicate', type: 'success', duration: 2000 })}>
      Add Toast
    </button>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deduplicates toasts with same message and type - does not create duplicate', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    const toasts = screen.getAllByRole('alert');
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toHaveTextContent('Duplicate');
  });
});
