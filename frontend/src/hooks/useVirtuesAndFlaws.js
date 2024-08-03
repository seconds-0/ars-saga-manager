// frontend/src/hooks/useVirtuesAndFlaws.js

import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api/axios';

export function useVirtuesAndFlaws(characterId) {
  const queryClient = useQueryClient();

  const fetchVirtuesFlaws = async () => {
    const response = await api.get(`/characters/${characterId}/virtues-flaws`);
    return response.data;
  };

  const { data, isLoading, error } = useQuery(['virtuesFlaws', characterId], fetchVirtuesFlaws);

  const addVirtueFlaw = useMutation(
    ({ referenceVirtueFlawId }) => api.post(`/characters/${characterId}/virtues-flaws`, { referenceVirtueFlawId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['virtuesFlaws', characterId]);
      },
    }
  );

  const removeVirtueFlaw = useMutation(
    (virtueFlawId) => api.delete(`/characters/${characterId}/virtues-flaws/${virtueFlawId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['virtuesFlaws', characterId]);
      },
    }
  );

  return {
    virtuesFlaws: data?.virtuesFlaws || [],
    remainingPoints: data?.remainingPoints || 0,
    isLoading,
    error,
    addVirtueFlaw,
    removeVirtueFlaw,
  };
}