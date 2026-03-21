import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions<T = any> {
  threshold?: number;
  onLoadMore: () => Promise<T[] | void>;
  hasMore: boolean;
  loaderDelay?: number;
}

export function useInfiniteScroll<T>({
  threshold = 100,
  onLoadMore,
  hasMore,
  loaderDelay = 500,
}: UseInfiniteScrollOptions<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const newItems = await onLoadMore();
      setItems((prev) => [
        ...prev,
        ...(Array.isArray(newItems) ? (newItems as T[]) : []),
      ]);
    } catch (error) {
      console.error("Infinite scroll load failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      { threshold, rootMargin: "20px" }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, loadMore, isLoading, hasMore]);

  return {
    items,
    setItems,
    isLoading,
    sentinelRef,
    loadMore,
  };
}
