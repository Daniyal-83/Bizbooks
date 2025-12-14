import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Processor from "./pages/Processor";
import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ element, roles }) {
  const { user, role } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return element;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} roles={["user"]} />} />
            <Route path="/invoices" element={<PrivateRoute element={<Invoices />} roles={["user"]} />} />
            <Route path="/processor" element={<PrivateRoute element={<Processor />} roles={["user"]} />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
