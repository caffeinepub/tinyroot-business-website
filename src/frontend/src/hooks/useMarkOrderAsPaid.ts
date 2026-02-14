import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface MarkOrderAsPaidParams {
  orderId: bigint;
  razorpayPaymentId: string;
}

export function useMarkOrderAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }: MarkOrderAsPaidParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markOrderAsPaid(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
    },
  });
}
