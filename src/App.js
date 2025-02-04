import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import OfficerData from "./pages/OfficerData";
import UserData from "./pages/UserData";
import AddOfficer from "./pages/AddOfficer";
import AddUser from "./pages/AddUser";
import EditOfficer from "./pages/EditOfficer";
import EditUser from "./pages/EditUser";
import EditWaterMeter from "./pages/EditWaterMeter";
import ChangeAdminPassword from "./pages/ChangeAdminPassword";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route untuk LoginPage tanpa Navbar */}
          <Route path="/" element={<LoginPage />} />

          {/* Route yang membutuhkan Navbar */}
          <Route
            element={
              <>
                <Navbar />
                <Outlet />
              </>
            }
          >
            <Route path="/OfficerData" element={<OfficerData />} />
            <Route path="/UserData" element={<UserData />} />
            <Route path="/AddOfficer" element={<AddOfficer />} />
            <Route path="/AddUser" element={<AddUser />} />
            <Route path="/EditOfficer" element={<EditOfficer />} />
            <Route path="/EditUser" element={<EditUser />} />
            <Route path="/EditWaterMeter" element={<EditWaterMeter />} />
            <Route path="/ChangeAdminPassword" element={<ChangeAdminPassword />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
