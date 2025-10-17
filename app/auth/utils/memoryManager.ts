import { useEffect, useRef, useCallback } from 'react';

// Memory management utilities
export class MemoryManager {
  private static subscriptions: Set<() => void> = new Set();
  private static animationFrames: Set<number> = new Set();
  private static timeouts: Set<NodeJS.Timeout> = new Set();

  // Track subscription for cleanup
  static trackSubscription(cleanup: () => void) {
    this.subscriptions.add(cleanup);
    return () => {
      this.subscriptions.delete(cleanup);
    };
  }

  // Track animation frame for cleanup
  static trackAnimationFrame(frameId: number) {
    this.animationFrames.add(frameId);
    return () => {
      this.animationFrames.delete(frameId);
    };
  }

  // Track timeout for cleanup
  static trackTimeout(timeoutId: NodeJS.Timeout) {
    this.timeouts.add(timeoutId);
    return () => {
      this.timeouts.delete(timeoutId);
    };
  }

  // Clean up all tracked resources
  static cleanup() {
    // Cancel all animation frames
    this.animationFrames.forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    this.animationFrames.clear();

    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();

    // Call all subscription cleanups
    this.subscriptions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    });
    this.subscriptions.clear();
  }

  // Get memory usage statistics
  static getMemoryStats() {
    return {
      subscriptions: this.subscriptions.size,
      animationFrames: this.animationFrames.size,
      timeouts: this.timeouts.size,
    };
  }
}

// React hooks for memory management
export function useMemoryCleanup() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const registerCleanup = useCallback((cleanup: () => void) => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    cleanupRef.current = cleanup;
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return registerCleanup;
}

// Hook for managing animation frames
export function useAnimationFrame(callback: () => void, dependencies: any[] = []) {
  const frameIdRef = useRef<number | null>(null);
  const registerCleanup = useMemoryCleanup();

  useEffect(() => {
    const animate = () => {
      callback();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    const cleanup = () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };

    registerCleanup(cleanup);

    return cleanup;
  }, dependencies);
}

// Hook for managing timeouts
export function useTimeout(callback: () => void, delay: number, dependencies: any[] = []) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const registerCleanup = useMemoryCleanup();

  useEffect(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(callback, delay);

    const cleanup = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    registerCleanup(cleanup);

    return cleanup;
  }, dependencies);
}

// Hook for managing intervals
export function useInterval(callback: () => void, delay: number, dependencies: any[] = []) {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const registerCleanup = useMemoryCleanup();

  useEffect(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(callback, delay);

    const cleanup = () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };

    registerCleanup(cleanup);

    return cleanup;
  }, dependencies);
}

// Hook for managing event listeners
export function useEventListener(
  eventName: string,
  handler: (event: any) => void,
  element: EventTarget | null = null,
  dependencies: any[] = []
) {
  const registerCleanup = useMemoryCleanup();

  useEffect(() => {
    const target = element || window;

    const eventHandler = (event: any) => {
      handler(event);
    };

    target.addEventListener(eventName, eventHandler);

    const cleanup = () => {
      target.removeEventListener(eventName, eventHandler);
    };

    registerCleanup(cleanup);

    return cleanup;
  }, dependencies);
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  // Track performance metric
  static trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 values
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
  }

  // Get average metric
  static getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  // Get metric statistics
  static getMetricStats(name: string) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return { min: 0, max: 0, average: 0, count: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = this.getAverageMetric(name);

    return { min, max, average, count: values.length };
  }

  // Clear all metrics
  static clearMetrics() {
    this.metrics.clear();
  }
}
