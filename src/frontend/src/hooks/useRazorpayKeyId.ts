import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRazorpayKeyId() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['razorpayKeyId'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRazorpayKeyId();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
