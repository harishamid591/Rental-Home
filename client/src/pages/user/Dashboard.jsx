import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-xl p-6 sm:p-10 w-full max-w-2xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Welcome, {user.name} 👋
        </h1>
        <div className="text-gray-600 space-y-2 mb-6">
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user.role}
          </p>
        </div>

        <button
          onClick={() => {
            dispatch(clearUser());
            navigate("/login");
          }}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
