import { useLocation, Navigate } from "react-router-dom";
import ElectionReport2, { Results } from "./pdfRNAfterVote";

export const ElectionReportwrapperAfter = () => {
  const location = useLocation();

  // Define what the state structure might look like
  interface LocationState {
    results?: Results;
    candidates?: any[]; // Fallback if candidates are separate
  }

  const state = location.state as LocationState | null;

  console.log("📄 PDF Wrapper State:", state);

  // 1. Validation
  if (!state || !state.results) {
    console.error("❌ Missing results — redirecting to dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 2. Data Preparation
  // Sometimes the backend array might be empty in one place but present in another
  // based on how the previous component passed the state.
  const finalResults = { ...state.results };

  // If results.candidates_with_votes is missing/empty, but state.candidates exists, use that.
  // if (
  //   (!finalResults.candidates_with_votes || finalResults.candidates_with_votes.length === 0) &&
  //   state.candidates && state.candidates.length > 0
  // ) {
  //   console.log("⚠️ Patching candidates from state sibling property");
  //   finalResults.candidates_with_votes = state.candidates;
  // }

  return <ElectionReport2 results={finalResults} />;
};