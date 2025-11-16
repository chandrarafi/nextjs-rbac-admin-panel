import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UsePermissionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  refreshInterval?: number;
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    page = 1,
    limit = 50,
    search = "",
    refreshInterval = 15000,
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/permissions?${params.toString()}`,
    fetcher,
    {
      revalidateOnMount: true, // ✅ Always fetch fresh data on mount
      revalidateOnFocus: true, // ✅ Fetch when window gains focus
      revalidateOnReconnect: true, // ✅ Fetch when reconnect
      dedupingInterval: 2000, // 2 seconds (shorter to allow fresh data on navigation)
      refreshInterval, // Auto-refresh interval (default 15s)
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      keepPreviousData: false, // Don't keep stale data
    }
  );

  return {
    permissions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}
