import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMenu() {
  const { data, error, isLoading, mutate } = useSWR("/api/menu", fetcher, {
    revalidateOnMount: true, // ✅ Always fetch fresh on mount
    revalidateOnFocus: true, // ✅ Refetch when window gains focus (important for menu changes)
    revalidateOnReconnect: true, // ✅ Refetch on reconnect
    dedupingInterval: 5000, // 5 seconds (allow fresh data)
    refreshInterval: 30000, // ✅ Auto-refresh every 30 seconds (critical for security)
    refreshWhenHidden: false, // Don't refresh when tab hidden
    refreshWhenOffline: false, // Don't refresh when offline
    keepPreviousData: false, // Don't keep stale menu data
  });

  return {
    menu: data || [],
    isLoading,
    isError: error,
    mutate, // For manual refresh
  };
}
