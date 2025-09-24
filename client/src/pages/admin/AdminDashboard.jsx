// src/pages/admin/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import Loader from "../../components/Loaders";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [yearlyData, setYearlyData] = useState([]);
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch summary
        const resSummary = await axios.get(`${API_URI}/api/adminDashboard`, {
          withCredentials: true,
        });

        console.log(resSummary)

        setSummary(resSummary.data.summary);

        // Fetch yearly financials
        const currentYear = new Date().getFullYear();
        const resYearly = await axios.get(
          `${API_URI}/api/adminDashboard/yearly-financials?year=${currentYear}`,
          { withCredentials: true }
        );
        setYearlyData(resYearly.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const formattedDate = now.toLocaleDateString("en-US", options); // e.g., "Tuesday, September 16, 2025"
    setDateString(formattedDate);
  }, []);


  if (loading) return <Loader />;

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  // Line Chart (Yearly Financial Overview)
  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Total Expenses",
        data: yearlyData.map((d) => d.totalExpenses),
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.3)",
        tension: 0.4,
      },
      {
        label: "Total Profit",
        data: yearlyData.map((d) => d.totalProfit),
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.3)",
        tension: 0.4,
      },
      {
        label: "Total Rent",
        data: yearlyData.map((d) => d.totalRent),
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.2)",
        tension: 0.4,
        hidden: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            const monthIndex = context.dataIndex;
            const monthData = yearlyData[monthIndex];
            if (datasetLabel === "Total Expenses") return `Expenses: QR ${monthData.totalExpenses}`;
            if (datasetLabel === "Total Profit") return `Profit: QR ${monthData.totalProfit}`;
            if (datasetLabel === "Total Rent") return `Rent: QR ${monthData.totalRent}`;
            return `${datasetLabel}: QR ${context.raw}`;
          },
        },
      },
      legend: { position: "top" },
      title: { display: false },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    scales: { y: { beginAtZero: true } },
  };

  // Profit/Loss Bar Chart
  const profitLossData = {
    labels: months,
    datasets: [
      {
        label: "Profit / Loss",
        data: yearlyData.map((d) => d.totalProfit),
        backgroundColor: yearlyData.map((d) =>
          d.totalProfit >= 0 ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.7)"
        ),
        borderColor: yearlyData.map((d) =>
          d.totalProfit >= 0 ? "green" : "red"
        ),
        borderWidth: 1,
      },
    ],
  };

  const profitLossOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            return value >= 0 ? `Profit: QR ${value}` : `Loss: QR ${Math.abs(value)}`;
          },
        },
      },
      legend: { display: false },
      title: { display: true, text: "Monthly Profit / Loss" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `QR ${v}` },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-2 sm:mt-0 text-gray-700 font-semibold">
        Today: {dateString}
      </div>
    </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Villas</h3>
          <p className="text-xl font-bold">{summary.totalVillas}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Houses</h3>
          <p className="text-xl font-bold">{summary.totalHouses}</p>
        </div>
        <div className="bg-green-50 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600">Occupied Houses</h3>
          <p className="text-xl font-bold">{summary.occupiedHouses}</p>
        </div>
        <div className="bg-red-50 shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600">Available Houses</h3>
          <p className="text-xl font-bold">{summary.availableHouses}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
          <p className="text-xl font-bold">{summary.totalTenants}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Rent Collected</h3>
          <p className="text-xl font-bold">QR {summary.monthlyRentCollected}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
          <p className="text-xl font-bold">
            QR {(summary.monthlyElectricity || 0) + (summary.monthlyMaintenance || 0)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Profit</h3>
          <p className="text-xl font-bold">QR {summary.monthlyProfit}</p>
        </div>
      </div>



      {/* Profit/Loss Chart */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Profit / Loss Overview</h3>
        <Bar data={profitLossData} options={profitLossOptions} />
      </div>

      {/* Optional Yearly Financial Line Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-2">Yearly Financial Overview</h3>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
