import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook that calls `onLoadMore` when a sentinel element
 * becomes visible in the viewport (via IntersectionObserver).
 *
 * @param {Function} onLoadMore - Callback to fetch the next page.
 * @param {boolean} enabled - Whether observation is active.
 * @param {number} rootMargin - How far from the viewport to trigger.
 * @returns {React.RefObject} - Ref to attach to the sentinel element.
 */
export default function useInfiniteScroll(
  onLoadMore,
  enabled = true,
  rootMargin = "200px"
) {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onLoadMore);

  // Keep the callback ref up-to-date without re-subscribing the observer
  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        callbackRef.current();
      }
    },
    [enabled]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin,
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersect, enabled, rootMargin]);

  return sentinelRef;
}
