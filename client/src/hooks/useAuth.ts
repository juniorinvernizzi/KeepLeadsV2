import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/simple-auth/user"],
    retry: false,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
}
