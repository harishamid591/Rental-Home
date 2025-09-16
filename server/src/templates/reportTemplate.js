export const generateReportHtml = (reportData, totals, month, year) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; margin-bottom: 20px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: center;
            }
            th {
              background: #f2f2f2;
            }
            .profit-positive { color: green; font-weight: bold; }
            .profit-negative { color: red; font-weight: bold; }
            .total-row {
              font-weight: bold;
              background: #eee;
            }
            .footer {
              text-align: right;
              font-size: 0.9em;
              color: #555;
            }
          </style>
        </head>
        <body>
          <h1>Villa Report - ${month}/${year}</h1>
          <table>
            <thead>
              <tr>
                <th>Villa</th>
                <th>Income</th>
                <th>Owner Rent</th>
                <th>Electricity</th>
                <th>Maintenance</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .map(
                  (r) => `
                <tr>
                  <td>${r.villaName}</td>
                  <td>${r.income}</td>
                  <td>${r.ownerRent}</td>
                  <td>${r.electricity}</td>
                  <td>${r.maintenance}</td>
                  <td class="${r.profit >= 0 ? "profit-positive" : "profit-negative"}">
                    ${r.profit}
                  </td>
                </tr>`
                )
                .join("")}
              <tr class="total-row">
                <td>Total</td>
                <td>${totals.income}</td>
                <td>${totals.ownerRent}</td>
                <td>${totals.electricity}</td>
                <td>${totals.maintenance}</td>
                <td class="${totals.profit >= 0 ? "profit-positive" : "profit-negative"}">
                  ${totals.profit}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
  };
  