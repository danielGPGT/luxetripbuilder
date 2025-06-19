import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AuthProvider } from "./lib/AuthProvider";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Pricing } from "./pages/Pricing";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NewProposal from "./pages/NewProposal";
import { Itineraries } from "./pages/Itineraries";
import ViewItinerary from "./pages/ViewItinerary";
import EditItinerary from "./pages/EditItinerary";
import { Dashboard } from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - with header, no sidebar */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path="/login" element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          } />
          <Route path="/signup" element={
            <PublicLayout>
              <Signup />
            </PublicLayout>
          } />
          <Route path="/pricing" element={
            <PublicLayout>
              <Pricing />
            </PublicLayout>
          } />
          <Route path="/features" element={
            <PublicLayout>
              <Features />
            </PublicLayout>
          } />
          <Route path="/about" element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } />
          
          {/* Protected routes with sidebar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/new-proposal" element={<NewProposal />} />
                    <Route path="/new-trip" element={<div>New Trip Page (Coming Soon)</div>} />
                    <Route path="/itineraries" element={<Itineraries />} />
                    <Route path="/itinerary/:id" element={<ViewItinerary />} />
                    <Route path="/edit-itinerary/:id" element={<EditItinerary />} />
                    <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
                    <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
