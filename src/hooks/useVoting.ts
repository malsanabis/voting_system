import { useState, useCallback } from 'react';
import { votesAPI } from '../services/voter.api';

export const useVoting = (voterId: string, positionName: string) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectCandidate = (candidateId: string) => setSelectedCandidate(candidateId);

  const submitVote = useCallback(async () => {
    if (!selectedCandidate) {
      return { success: false, message: 'يجب اختيار مرشح' };
    }

    try {
      setIsSubmitting(true);
      const result = await votesAPI.submit({
        VoterId: voterId,
        choices: [{ positionName, candidateId: selectedCandidate }]
      });
      setSelectedCandidate(null);
      return { success: true, message: result.message };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'فشل التصويت' 
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [voterId, positionName, selectedCandidate]);

  return { selectedCandidate, isSubmitting, selectCandidate, submitVote };
};
