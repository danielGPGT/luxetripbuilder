import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./lib/AuthProvider";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NewProposal from "./pages/NewProposal";
import { Itineraries } from "./pages/Itineraries";
import ViewItinerary from "./pages/ViewItinerary";
import EditItinerary from "./pages/EditItinerary";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/new-proposal" element={<NewProposal />} />
                    <Route path="/new-trip" element={<div>New Trip Page (Coming Soon)</div>} />
                    <Route path="/itineraries" element={<Itineraries />} />
                    <Route path="/itinerary/:id" element={<ViewItinerary />} />
                    <Route path="/edit-itinerary/:id" element={<EditItinerary />} />
                    <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
                    <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Toaster position="top-right" />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
