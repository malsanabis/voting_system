export const generateMatamReport = async (results: any, candidates: any[]) => {
  const dateStr = new Date().toLocaleDateString('ar-BH');

  // Create printable HTML container
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert('لم يتم فتح نافذة الطباعة');

  printWindow.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير نتائج مأتم السنابس</title>
        <style>
          body {
            font-family: 'Amiri', 'Scheherazade', serif;
            margin: 40px;
            direction: rtl;
            text-align: right;
          }
          h1, h2, h3 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            font-size: 14px;
          }
          th {
            background-color: #f0f0f0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #555;
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet">
      </head>
      <body>
        <h1>النتائج النهائية لانتخابات مأتم السنابس</h1>
        <p><strong>التاريخ:</strong> ${dateStr}</p>
        <p><strong>الناخبين المسجلين:</strong> ${results.total_users || 0} | 
           <strong>أصوات صحيحة:</strong> ${results.total_votes || 0}</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الكامل</th>
              <th>الموقع</th>
              <th>الطريقة</th>
              <th>الأصوات</th>
            </tr>
          </thead>
          <tbody>
            ${candidates.map((cand, index) => {
              const votes = results.vote_map?.[cand.id] || 0;
              const method = cand.position_status === 'single' ? "تزكية" : "انتخاب";
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${cand.full_name}</td>
                  <td>${cand.position_name}</td>
                  <td>${method}</td>
                  <td>${votes}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تم توليد هذا التقرير آليًا بواسطة نظام مأتم السنابس</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
