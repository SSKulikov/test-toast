import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastItem } from './ToastItem';
import type { Toast } from '../types/types';

describe('ToastItem', () => {
  const mockToast: Toast = {
    id: 'test-1',
    message: 'Test message',
    type: 'success',
    duration: 500,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pauses timer on mouseEnter and toast stays visible after duration', () => {
    const onRemove = vi.fn();
    render(
      <ToastItem toast={mockToast} onRemove={onRemove} />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.mouseEnter(screen.getByRole('alert'));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('removes toast after duration when not hovered', () => {
    const onRemove = vi.fn();
    render(
      <ToastItem toast={mockToast} onRemove={onRemove} />
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onRemove).toHaveBeenCalledWith('test-1');
  });

  it('resets timer when resetKey changes (deduplication)', () => {
    const onRemove = vi.fn();
    const { rerender } = render(
      <ToastItem toast={mockToast} onRemove={onRemove} />
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    rerender(
      <ToastItem
        toast={{ ...mockToast, resetKey: 1 }}
        onRemove={onRemove}
      />
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onRemove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onRemove).toHaveBeenCalledWith('test-1');
  });
});
