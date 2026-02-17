import { createContext, useContext, useState, ReactNode } from "react";
import type { Candidate } from "../services/voter.api";

interface VotingContextType {
  votes: Record<string, Candidate>;
  completedPositions: Set<string>;
  setVote: (positionName: string, candidate: Candidate) => void;
  reset: () => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const VotingProvider = ({ children }: { children: ReactNode }) => {
  const [votes, setVotes] = useState<Record<string, Candidate>>({});
  const [completedPositions, setCompletedPositions] = useState<Set<string>>(new Set());

  const setVote = (positionName: string, candidate: Candidate) => {
    setVotes(prev => ({ ...prev, [positionName]: candidate }));
    setCompletedPositions(prev => {
      const next = new Set(prev);
      next.add(positionName);
      return next;
    });
  };

  const reset = () => {
    setVotes({});
    setCompletedPositions(new Set());
  };

  return (
    <VotingContext.Provider value={{ votes, completedPositions, setVote, reset }}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVotingContext = () => {
  const ctx = useContext(VotingContext);
  if (!ctx) throw new Error("useVotingContext must be used within VotingProvider");
  return ctx;
};
