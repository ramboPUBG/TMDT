import useSWR from 'swr';
import api from '../services/api';

const fetcher = async <Data>(url: string): Promise<Data> => {
  return api.get(url) as Promise<Data>;
};

export function useFetch<Data = unknown, Error = unknown>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Data, Error>(url, fetcher);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}
