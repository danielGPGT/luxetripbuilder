import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AuthProvider, useAuth } from "./lib/AuthProvider";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Pricing } from "./pages/Pricing";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { HowItWorks } from "./pages/HowItWorks";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { BlogCategory } from "./pages/BlogCategory";
import { BlogAuthor } from "./pages/BlogAuthor";
import { BlogTag } from "./pages/BlogTag";
import { BlogArchive } from "./pages/BlogArchive";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NewProposal from "./pages/NewProposal";
import { Itineraries } from "./pages/Itineraries";
import ViewItinerary from "./pages/ViewItinerary";
import EditItinerary from "./pages/EditItinerary";
import { Dashboard } from "./pages/Dashboard";
import QuoteTest from "./pages/QuoteTest";
import Quotes from "./pages/Quotes";
import Bookings from "./pages/Bookings";
import ViewQuote from "./pages/ViewQuote";
import MediaLibrary from "./pages/MediaLibrary";
import OrderConfirmation from "./pages/OrderConfirmation";
import Settings from "./pages/Settings";
import UndrawGallery from "./pages/UndrawGallery";
import ChoosePlan from "./pages/ChoosePlan";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  return (
    <>
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
        <Route path="/how-it-works" element={
          <PublicLayout>
            <HowItWorks />
          </PublicLayout>
        } />          
        <Route path="/blog" element={
          <PublicLayout>
            <Blog />
          </PublicLayout>
        } />
        <Route path="/blog/:slug" element={
          <PublicLayout>
            <BlogPost />
          </PublicLayout>
        } />
        <Route path="/blog/category/:category" element={
          <PublicLayout>
            <BlogCategory />
          </PublicLayout>
        } />
        <Route path="/blog/author/:authorSlug" element={
          <PublicLayout>
            <BlogAuthor />
          </PublicLayout>
        } />
        <Route path="/blog/tag/:tag" element={
          <PublicLayout>
            <BlogTag />
          </PublicLayout>
        } />
        <Route path="/blog/archive/:year" element={
          <PublicLayout>
            <BlogArchive />
          </PublicLayout>
        } />
        <Route path="/blog/archive/:year/:month" element={
          <PublicLayout>
            <BlogArchive />
          </PublicLayout>
        } />
        <Route path="/undraw-gallery" element={
          <PublicLayout>
            <UndrawGallery />
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
                  <Route path="/quote-test" element={<QuoteTest />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/media-library" element={<MediaLibrary />} />
                  <Route path="/quote/:quoteId" element={<ViewQuote />} />
                  <Route path="/order/success" element={<OrderConfirmation />} />
                  <Route path="/choose-plan" element={<ChoosePlan />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
