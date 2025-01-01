import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import OfficerData from "./pages/OfficerData";
import UserData from "./pages/UserData";
import AddOfficer from "./pages/AddOfficer";
import AddUser from "./pages/AddUser";

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
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
