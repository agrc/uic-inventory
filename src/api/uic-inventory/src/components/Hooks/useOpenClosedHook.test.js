import { renderHook, act } from '@testing-library/react';
import { useOpenClosed } from './useOpenClosedHook';
import { test, expect } from 'vitest';

test('toggle should switch state', () => {
  const { result } = renderHook(() => useOpenClosed());

  expect(result.current[0]).toBe(false);

  act(() => {
    result.current[1].toggle();
  });

  expect(result.current[0]).toBe(true);
});

test('allows for initial state', () => {
  const { result } = renderHook(() => useOpenClosed(true));

  expect(result.current[0]).toBe(true);
});

test('open should set state to true', () => {
  const { result } = renderHook(() => useOpenClosed());

  expect(result.current[0]).toBe(false);

  act(() => {
    result.current[1].open();
  });

  expect(result.current[0]).toBe(true);
});

test('close should set state to true', () => {
  const { result } = renderHook(() => useOpenClosed(true));

  expect(result.current[0]).toBe(true);

  act(() => {
    result.current[1].close();
  });

  expect(result.current[0]).toBe(false);
});
