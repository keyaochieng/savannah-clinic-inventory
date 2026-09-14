import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useListParams } from './useListParams';

// Render the hook inside a MemoryRouter starting at a given URL, so we can
// read the URL state it derives and assert how the setters change it.
function renderListParams(initialUrl: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  );
  return renderHook(() => useListParams(), { wrapper });
}

describe('useListParams', () => {
  it('reads search, category, sort and page from the URL', () => {
    const { result } = renderListParams('/?q=phone&category=smartphones&sort=price-asc&page=2');
    // q and category can't both be truthy in normal use, but the hook should
    // still read whatever is in the URL faithfully.
    expect(result.current.search).toBe('phone');
    expect(result.current.category).toBe('smartphones');
    expect(result.current.sort).toBe('price-asc');
    expect(result.current.page).toBe(2);
  });

  it('defaults page to 1 and clamps invalid page values', () => {
    const { result } = renderListParams('/?page=abc');
    expect(result.current.page).toBe(1);
  });

  it('resets to page 1 when the category changes (never strands on an empty page)', () => {
    const { result } = renderListParams('/?page=5');
    act(() => result.current.setCategory('smartphones'));
    expect(result.current.page).toBe(1);
    expect(result.current.category).toBe('smartphones');
  });

  it('selecting a category clears any active search (they do not compose)', () => {
    const { result } = renderListParams('/?q=phone');
    act(() => result.current.setCategory('smartphones'));
    expect(result.current.category).toBe('smartphones');
    expect(result.current.search).toBe('');
  });

  it('typing a search clears any active category', () => {
    const { result } = renderListParams('/?category=smartphones');
    act(() => result.current.setSearch('phone'));
    expect(result.current.search).toBe('phone');
    expect(result.current.category).toBe('');
  });
});
