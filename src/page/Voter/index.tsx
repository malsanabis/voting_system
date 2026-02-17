import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { EnterTheIdNumber } from "./EnterTheIdNumber";
import { ChoosePositionBeforeVoting } from "./ChoosePositionBeforeVoting";
import { ChoosePositionAfterVoting } from "./ChoosePositionAfterVoting";
import { VoteSuccess } from "./VoteSuccess";

// 1. Define the shape of the data we need to save for the UI to update
export interface Candidate {
  id: string;
  name: string;
  imageUrl: string;
}

// 2. Update the Context Type
interface VotingContextType {
  completedPositions: Set<string>;
  votes: Record<string, Candidate>; // Key is positionID, Value is Candidate Object
  setCompletedPositions: React.Dispatch<React.SetStateAction<Set<string>>>;
  setVotes: React.Dispatch<React.SetStateAction<Record<string, Candidate>>>;
}

// 3. Create Context with the new type
export const VotingContext = createContext<VotingContextType>({
  completedPositions: new Set(),
  votes: {},
  setCompletedPositions: () => {},
  setVotes: () => {},
});

const App = () => {
  const [completedPositions, setCompletedPositions] = useState<Set<string>>(new Set());
  
  // 4. Update the state to hold the objects
  const [votes, setVotes] = useState<Record<string, Candidate>>({});

  return (
    <VotingContext.Provider value={{ completedPositions, votes, setCompletedPositions, setVotes }}>
      <Router>
        <Routes>
          <Route path="/" element={<EnterTheIdNumber />} />
          <Route path="/positions" element={<ChoosePositionBeforeVoting />} />
          <Route path="/vote/:position" element={<ChoosePositionAfterVoting />} />
          <Route path="/success" element={<VoteSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </VotingContext.Provider>
  );
};

export default App;