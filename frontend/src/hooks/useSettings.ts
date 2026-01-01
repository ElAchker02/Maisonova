import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings-public"],
    queryFn: () => api.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
};
