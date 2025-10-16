import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await get<any>('/users');
      return (res?.data ?? res) as Array<{ _id: string; fullName: string; email: string; role: string; isActive: boolean; lastLoginAt?: string }>; 
    },
  });
}


