import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type KeyboardViewportMetrics = {
  /** Pixels covered by the keyboard at the bottom of the layout viewport. */
  inset: number;
  /** visualViewport.offsetTop — must be compensated so touch targets stay aligned. */
  offsetTop: number;
};

function readMetrics(): KeyboardViewportMetrics {
  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return { inset: 0, offsetTop: 0 };
  }

  const offsetTop = visualViewport.offsetTop;
  const inset = Math.max(
    0,
    window.innerHeight - visualViewport.height - offsetTop,
  );

  return {
    inset: Math.round(inset),
    offsetTop: Math.round(offsetTop),
  };
}

/**
 * On web, how many CSS pixels the on-screen keyboard covers at the bottom
 * of the layout viewport, plus visualViewport.offsetTop for touch/visual sync.
 * Always `{ inset: 0, offsetTop: 0 }` on native.
 */
export function useKeyboardViewport(): KeyboardViewportMetrics {
  const [metrics, setMetrics] = useState<KeyboardViewportMetrics>({
    inset: 0,
    offsetTop: 0,
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return;
    }

    let baseline = readMetrics().inset;

    const update = () => {
      const next = readMetrics();
      if (next.inset < baseline) {
        baseline = next.inset;
      }
      setMetrics({
        inset: Math.max(0, next.inset - baseline),
        offsetTop: next.offsetTop,
      });
      window.scrollTo(0, 0);
    };

    const resetBaseline = () => {
      baseline = readMetrics().inset;
      setMetrics({ inset: 0, offsetTop: 0 });
      window.scrollTo(0, 0);
    };

    update();
    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('orientationchange', resetBaseline);

    return () => {
      visualViewport.removeEventListener('resize', update);
      visualViewport.removeEventListener('scroll', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', resetBaseline);
    };
  }, []);

  return metrics;
}

/** @deprecated Prefer useKeyboardViewport().inset — kept for call-site compatibility. */
export function useKeyboardBottomInset() {
  return useKeyboardViewport().inset;
}
