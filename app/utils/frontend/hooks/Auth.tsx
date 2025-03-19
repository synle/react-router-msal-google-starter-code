import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "~/types.d.ts";

export function useMeProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => axios.get<User>(`/api/auth/me`).then((r) => r.data),
    retry: false,
  });
}
