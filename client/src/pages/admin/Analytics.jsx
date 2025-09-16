// src/pages/admin/Reports/ReportPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import toast from "react-hot-toast";
import Loader from "../../components/Loaders";

const ReportPage = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [villaId, setVillaId] = useState("");
  const [villas, setVillas] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);

  const monthLabel = new Date(month + "-01").toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Fetch villas
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const res = await axios.get(`${API_URI}/api/villas`, { withCredentials: true });
        setVillas(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load villas");
      }
    };
    fetchVillas();
  }, []);

  // Fetch report whenever month or villa changes
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, villaId]);

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    try {
      const [y, m] = month.split("-");
      const query = `?month=${m}&year=${y}${villaId ? `&villaId=${villaId}` : ""}`;
      const res = await axios.get(`${API_URI}/api/reports${query}`, { withCredentials: true });
      setReportData(res.data.reportData);
      setTotals(res.data.totals);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  // Export report as PDF
  const exportPDF = async () => {
    try {
      const [y, m] = month.split("-");
      const query = `?month=${m}&year=${y}${villaId ? `&villaId=${villaId}` : ""}`;
      const res = await axios.get(`${API_URI}/api/reports/export${query}`, {
        withCredentials: true,
        responseType: "blob", // important for file download
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report-${monthLabel}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    }
  };

  const totalIncome = totals.income || 0;
  const totalOwnerRent = totals.ownerRent || 0;
  const totalElectricity = totals.electricity || 0;
  const totalMaintenance = totals.maintenance || 0;
  const totalOther = totals.other || 0;
  const totalProfit = totals.profit || 0;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Monthly Report – {monthLabel}</h1>

        <div className="flex flex-wrap gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          />

          <select
            value={villaId}
            onChange={(e) => setVillaId(e.target.value)}
            className="border px-3 py-2 rounded-md cursor-pointer"
          >
            <option value="">All Villas</option>
            {villas.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>

          <button
            onClick={exportPDF}
            className="bg-red-500 text-white cursor-pointer px-4 py-2 rounded-md shadow hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border text-center border-blue-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Income</p>
          <h2 className="text-2xl font-bold text-blue-700">QR {totalIncome}</h2>
        </div>
        <div className="bg-green-50 border text-center border-green-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <h2 className="text-2xl font-bold text-green-700">
            QR {totalOwnerRent + totalElectricity + totalMaintenance + totalOther}
          </h2>
        </div>
        <div className="bg-yellow-50 border text-center border-yellow-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total Profit</p>
          <h2
            className={`text-2xl font-bold ${
              totalProfit < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            QR {totalProfit}
          </h2>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-800 text-white text-sm sm:text-base">
                <th className="px-4 py-3 text-left">Villa</th>
                <th className="px-4 py-3 text-left">Income (QR)</th>
                <th className="px-4 py-3 text-left">Owner Rent (QR)</th>
                <th className="px-4 py-3 text-left">Electricity (QR)</th>
                <th className="px-4 py-3 text-left">Maintenance (QR)</th>
                <th className="px-4 py-3 text-left">Profit (QR)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No report data found
                  </td>
                </tr>
              ) : (
                reportData.map((r, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{r.villaName}</td>
                    <td className="px-4 py-3 font-semibold text-center">{r.income}</td>
                    <td className="px-4 py-3 font-semibold text-center">{r.ownerRent}</td>
                    <td className="px-4 py-3 font-semibold text-center">{r.electricity}</td>
                    <td className="px-4 py-3 font-semibold text-center">{r.maintenance}</td>
                    <td
                      className={`px-4 py-3 font-bold text-center ${
                        r.profit < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {r.profit}
                    </td>
                  </tr>
                ))
              )}

              {reportData.length > 0 && (
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-center">{totalIncome}</td>
                  <td className="px-4 py-3 text-center">{totalOwnerRent}</td>
                  <td className="px-4 py-3 text-center">{totalElectricity}</td>
                  <td className="px-4 py-3 text-center">{totalMaintenance}</td>
                  <td
                    className={`px-4 py-3 text-center ${
                      totalProfit < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {totalProfit}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
