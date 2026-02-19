import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from './hooks/useVoterAuth';
import { AdminProtectedRoutes } from './hooks/useAdminAuth';
import {VoterMgmProtectedRoutes} from "./hooks/useVoterMgmAuth"


import VoterStatusListing from "./page/list/ListPage";

// Voter Pages
import { EnterTheIdNumber } from "./page/Voter/EnterTheIdNumber";
import { ChoosePositionBeforeVoting } from "./page/Voter/ChoosePositionBeforeVoting";
import { ChoosePositionAfterVoting } from "./page/Voter/ChoosePositionAfterVoting";
import { VoteSuccess } from "./page/Voter/VoteSuccess";

// Admin Pages
import { AdminLogin } from "./page/Admin/AdminLogin";
import { AdminDashboard } from "./page/Admin/AdminDashboard";
import { CurrentCandidates } from "./page/Admin/CurrentCandidates";
import { CreateCandidate } from "./page/Admin/CreateCandidate";
import CreateVoterMgmt from "./page/Admin/CreateVoterMgmt"
import {ElectionReportWrapper} from "./page/pdf/pdfwrapper"
import {ElectionReportNUmWrapper} from "./page/pdf/pdfwrapperNum"
import {VoterListReportWrapper} from "./page/pdf/VoterReportWrapper";

// Voter Mgmt Pages
import { VoterMangmentLogin } from "./page/VoterManager/VoterMangmentLogin";
import VoterList  from "./page/VoterManager/VoterList";
import VoterForm  from "./page/VoterManager/VoterForm"; 

// Your existing Candidate interface + VotingContext
export interface Candidate {
  _id: string;
  full_Name: string;
  image: string;
}

interface VotingContextType {
  completedPositions: Set<string>;
  votes: Record<string, Candidate>;
  setCompletedPositions: React.Dispatch<React.SetStateAction<Set<string>>>;
  setVotes: React.Dispatch<React.SetStateAction<Record<string, Candidate>>>;
}

export const VotingContext = createContext<VotingContextType>({
  completedPositions: new Set(),
  votes: {},
  setCompletedPositions: () => {},
  setVotes: () => {},
});

const App = () => {
  const [completedPositions, setCompletedPositions] = useState<Set<string>>(new Set());
  const [votes, setVotes] = useState<Record<string, Candidate>>({});

  return (
    <VotingContext.Provider value={{ completedPositions, votes, setCompletedPositions, setVotes }}>
      <Router>
        <Routes>
          {/* ✅ PUBLIC ROUTES */}
          <Route path="/" element={<EnterTheIdNumber />} />
          <Route path="/admin-login" element={<AdminLogin/>} />
          <Route path="/voterMgmt-login" element={<VoterMangmentLogin/>} />

          <Route path="/live-status" element={<VoterStatusListing />} />

            {/* ✅ VOTER PROTECTED ROUTES - FIXED */}
            <Route path="/voter" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/positions" replace />} />
            <Route path="positions" element={<ChoosePositionBeforeVoting />} />
            <Route path="vote/:position" element={<ChoosePositionAfterVoting />} />
            <Route path="success" element={<VoteSuccess />} />
          </Route>

          {/* ✅ ADMIN PROTECTED ROUTES - NEW STRUCTURE */}
          <Route path="/admin" element={<AdminProtectedRoutes />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="candidates" element={<CurrentCandidates />} />
            <Route path="candidates/create" element={<CreateCandidate />} />
            <Route path="candidates/:id/edit" element={<CreateCandidate />} />
            <Route path="/admin/staff" element={<CreateVoterMgmt />} />
            <Route path="print/election-report" element={<ElectionReportWrapper />} />
            <Route path="print/election-total-report" element={<ElectionReportNUmWrapper />} />
            <Route path="print/voter-report" element={<VoterListReportWrapper />} />
          </Route>




          {/* ✅ Voter Mgmt PROTECTED ROUTES - NEW STRUCTURE */}
          <Route path="/voterMgmt" element={<VoterMgmProtectedRoutes />}>
            <Route index element={<Navigate to="voters" replace />} />
            <Route path="voters" element={<VoterList />} />
            <Route path="voter/create" element={<VoterForm />} />
            <Route path="voter/:voterId/edit" element={<VoterForm />} />
          </Route>


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </VotingContext.Provider>
  );
};

export default App;
