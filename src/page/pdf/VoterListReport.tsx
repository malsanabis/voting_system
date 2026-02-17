import React from "react";

export interface VotedVoter {
  full_name: string;
  membership_type: string;
}

export interface VoterListResults {
  count: number;
  voters: VotedVoter[];
}

interface VoterListReportProps {
  data: VoterListResults;
}

const VoterListReport: React.FC<VoterListReportProps> = ({ data }) => {
  const dateStr = new Date().toLocaleDateString("ar-BH");
  const voters = data?.voters ?? [];

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="report-wrapper">
      <button className="download-button" onClick={handleDownloadPDF}>
        📥 تحميل كشف الحضور (PDF)
      </button>

      <div className="page-container">
        {/* الخلفية الرسمية */}
        <img src="/A4.png" className="background-img" alt="Background" />

        <div className="content">
          <h1 className="title">سجل أسماء الناخبين المشاركين</h1>
          <h2 className="subtitle">انتخابات مجلس الإدارة (1447-1450هـ)</h2>

          <div className="topRight">{dateStr}</div>

          <div className="greeting">كشف الحضور والانتخاب</div>

          <p className="paragraph">
            نرفق لكم القائمة النهائية لأسماء السادة الناخبين الذين حضروا وأتموا عملية الإدلاء بأصواتهم بنجاح، حيث بلغت الحصيلة الإجمالية للمصوتين:
          </p>

          <div className="voteSummary">
            إجمالي عدد الحضور: <strong>{data.count}</strong> ناخب
          </div>

          <table className="resultsTable">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>م</th>
                <th style={{ width: "65%" }}>اسم الناخب</th>
                <th style={{ width: "25%" }}>نوع العضوية</th>
              </tr>
            </thead>
            <tbody>
              {voters.length > 0 ? (
                voters.map((voter, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="name-cell">{voter.full_name}</td>
                    <td>{voter.membership_type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>لا توجد بيانات مسجلة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="footer-signature">
            <p>ختم وتوقيع اللجنة المشرفة</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .download-button { display: none !important; }
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-container { box-shadow: none !important; margin: 0 !important; }
        }

        .report-wrapper {
          background-color: #f5f5f5;
          padding: 40px 0;
          min-height: 100vh;
        }

        .page-container {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          font-family: "Amiri", serif;
          direction: rtl;
          background-color: white;
          overflow: hidden;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .background-img {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: fill;
          z-index: 0;
        }

        .content {
          position: relative;
          z-index: 10;
          padding: 65mm 20mm 20mm 20mm; /* إزاحة النص للأسفل لتجنب الترويسة */
        }

        .title { text-align: center; font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { text-align: center; font-size: 18px; margin-bottom: 20px; color: #444; }

        .topRight { position: absolute; top: 55mm; right: 25mm; font-weight: bold; }

        .greeting { 
          margin-top: 25px; 
          font-weight: bold; 
          font-size: 18px; 
          border-bottom: 1px solid #000; 
          display: inline-block;
        }

        .paragraph { margin-top: 15px; font-size: 16px; line-height: 1.6; text-align: justify; }

        .voteSummary {
          margin: 15px 0;
          text-align: center;
          font-size: 18px;
          background: rgba(240, 240, 240, 0.5);
          padding: 10px;
          border: 1px solid #ddd;
        }

        .resultsTable {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .resultsTable th, .resultsTable td {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
          font-size: 15px;
        }

        .resultsTable th { 
          background-color: #f2f2f2 !important; 
          -webkit-print-color-adjust: exact;
        }

        .name-cell { text-align: right !important; padding-right: 15px !important; }

        .footer-signature {
          margin-top: 60px;
          text-align: left;
          padding-left: 50px;
          font-weight: bold;
          font-size: 18px;
        }

        .download-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 12px 25px;
          background-color: #27ae60;
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          z-index: 999;
        }
      `}</style>
    </div>
  );
};

export default VoterListReport;