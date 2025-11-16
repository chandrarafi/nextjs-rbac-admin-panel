import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  refreshInterval?: number; // Allow custom refresh interval
}

export function useUsers(options: UseUsersOptions = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    refreshInterval = 10000,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/users?${params.toString()}`,
    fetcher,
    {
      revalidateOnMount: true, // ✅ Always fetch fresh data on mount
      revalidateOnFocus: true, // ✅ Fetch when window gains focus
      revalidateOnReconnect: true, // ✅ Fetch when reconnect
      dedupingInterval: 2000, // 2 seconds (shorter to allow fresh data on navigation)
      refreshInterval, // Auto-refresh interval (default 10s)
      refreshWhenHidden: false, // Don't refresh when tab is hidden
      refreshWhenOffline: false, // Don't refresh when offline
      keepPreviousData: false, // Don't keep stale data
    }
  );

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}
