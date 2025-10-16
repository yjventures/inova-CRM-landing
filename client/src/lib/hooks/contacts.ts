import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

export type ContactsQuery = {
  q?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
};

export type ContactListItem = { _id: string; fullName: string; email?: string; company?: string; status: 'active'|'inactive'; lastContactedAt?: string };
export type ContactsListResponse = { ok: boolean; data: ContactListItem[]; meta?: { page: number; limit: number; total: number; pages: number } };

export function useContacts(query: ContactsQuery) {
  const params = { ...query };
  return useQuery<ContactsListResponse>({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const res = await get<any>('/contacts', params);
      return res as ContactsListResponse;
    },
    keepPreviousData: true,
  });
}

export function useContact(contactId?: string) {
  return useQuery({
    queryKey: ['contacts', contactId],
    queryFn: async () => {
      if (!contactId) return null;
      const res = await get<any>(`/contacts/${contactId}`);
      return res?.data ?? null;
    },
    enabled: Boolean(contactId),
  });
}

export function useContactDeals(contactId?: string) {
  return useQuery({
    queryKey: ['contacts', contactId, 'deals'],
    queryFn: async () => {
      if (!contactId) return [] as any[];
      const res = await get<any>(`/contacts/${contactId}/deals`);
      return res?.data ?? [];
    },
    enabled: Boolean(contactId),
  });
}

export function useContactActivities(contactId?: string) {
  return useQuery({
    queryKey: ['contacts', contactId, 'activities'],
    queryFn: async () => {
      if (!contactId) return [] as any[];
      const res = await get<any>(`/contacts/${contactId}/activities`);
      return res?.data ?? [];
    },
    enabled: Boolean(contactId),
  });
}


