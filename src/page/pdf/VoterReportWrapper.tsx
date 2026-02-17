import { useLocation, Navigate } from "react-router-dom";
import VoterListReport, { VoterListResults } from "./VoterListReport";

export const VoterListReportWrapper = () => {
  const location = useLocation();

  // الحصول على الـ state الممرر من الـ Dashboard
  const state = location.state as { type: string; voterData: VoterListResults } | null;

  console.log("📄 Voter List Wrapper State:", state);

  // التحقق من أننا في المسار الصحيح ومعنا البيانات
  if (!state || state.type !== "VOTER_LIST" || !state.voterData) {
    console.error("❌ بيانات التقرير مفقودة - إعادة التوجيه للوحة التحكم");
    return
    // return <Navigate to="/admin/dashboard" replace />;
  }

  return <VoterListReport data={state.voterData} />;
};