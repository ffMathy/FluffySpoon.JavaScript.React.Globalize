import { useGlobalState, createGlobalState } from './'
import { renderHook, act } from "@testing-library/react-hooks";

// mock timer using jest
jest.useFakeTimers();

const globalValueKey = createGlobalState('initial');

describe('useGlobal', () => {
  it('shares state', () => {
    const result1 = renderHook(() => useGlobalState(globalValueKey));
    const result2 = renderHook(() => useGlobalState(globalValueKey));

    expect(result1.result.current[0]).toBe("initial");
    expect(result2.result.current[0]).toBe("initial");

    act(() => result1.result.current[1]("something"));

    expect(result1.result.current[0]).toBe("something");
    expect(result2.result.current[0]).toBe("something");
  });
})
