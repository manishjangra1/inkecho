// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Logo, LogoMark } from './logo';

describe('Logo and LogoMark', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders LogoMark SVG with continuous ribbon and center bar', () => {
    act(() => {
      root.render(<LogoMark sizeClassName="h-6 w-6" />);
    });

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 512 512');
    expect(container.querySelector('path')).toBeDefined();
    expect(container.querySelector('line')).toBeDefined();
    expect(container.querySelector('circle')).toBeDefined();
  });

  it('renders full Logo with wordmark text and link', () => {
    act(() => {
      root.render(<Logo href="/" size="md" showText={true} />);
    });

    const link = container.querySelector('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/');
    expect(container.textContent).toContain('InkEcho');
  });
});
