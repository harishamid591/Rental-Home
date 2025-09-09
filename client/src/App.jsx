import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import AdminRoutes from "./routes/AdminRoutes";
import TenantRoutes from "./routes/TenantRoutes";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}/>
        
        <Route path="/admin/*" element={<AdminRoutes />} />

        <Route path="/*" element={<TenantRoutes />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes> 
    </BrowserRouter>
  )
}

export default App;
