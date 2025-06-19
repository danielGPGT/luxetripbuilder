import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { auth } from "@/lib/auth";
import LuxeLogo from "@/assets/Luxe.svg";
import img1 from "@/assets/imgs/james-donaldson-toPRrcyAIUY-unsplash.jpg";
import img2 from "@/assets/imgs/fredrik-ohlander-fCW1hWq2nq0-unsplash.jpg";
import img3 from "@/assets/imgs/spencer-davis-Ivwyqtw3PzU-unsplash.jpg";
import img4 from "@/assets/imgs/igor-oliyarnik-Uu5aXBI1oLk-unsplash.jpg";

const carouselImages = [img1, img2, img3, img4];

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const startTransition = (newIdx: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setNextIdx(newIdx);
    
    // Complete the transition after animation
    setTimeout(() => {
      setCarouselIdx(newIdx);
      setIsTransitioning(false);
    }, 1000);
  };

  const nextSlide = () => {
    const newIdx = (carouselIdx + 1) % carouselImages.length;
    startTransition(newIdx);
  };

  // Optional: auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselIdx, isTransitioning]);

  const handleSlideChange = (idx: number) => {
    if (isTransitioning || idx === carouselIdx) return;
    startTransition(idx);
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !name) {
      setError("All fields are required");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await auth.signUp(email, password, name);
      setSuccess("Account created successfully! Please check your email to verify your account.");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white p-8 relative overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {/* Current Image */}
          <img
            src={carouselImages[carouselIdx]}
            alt="Travel background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-40'
            }`}
          />
          {/* Next Image (for smooth transition) */}
          {isTransitioning && (
            <img
              src={carouselImages[nextIdx]}
              alt="Travel background"
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000 ease-in-out"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
        </div>
        
        {/* Top content */}
        <div className="relative flex flex-col space-y-6 z-10 mt-8">
          <h2 className="text-4xl font-bold leading-tight">
            Start Your Luxury Journey
          </h2>
          <p className="text-lg text-gray-200 max-w-md">
            Join thousands of travelers who trust LuxeTripBuilder for their premium travel experiences.
          </p>
        </div>
        
        {/* Bottom quote */}
        <div className="relative z-10 mb-8">
          <blockquote className="text-lg italic text-gray-300">
            "The best journeys are those that are perfectly tailored to your dreams."
          </blockquote>
          <p className="text-sm text-gray-400 mt-2">— Luxury Travel Expert</p>
        </div>
        
        {/* Carousel Indicators */}
        <div className="relative z-10 flex justify-center space-x-2">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSlideChange(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === carouselIdx ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-6 bg-card rounded-xl shadow-lg p-8 flex flex-col items-center">
          <img src={LuxeLogo} alt="LuxeTripBuilder Logo" className="h-12 mb-6 lg:hidden" />
          <h1 className="text-2xl font-bold text-center text-primary">
            Create your account
          </h1>
          <p className="text-center text-muted-foreground text-sm">
            Start building luxury travel experiences today
          </p>
          
          <form onSubmit={handleSignup} className="space-y-4 w-full">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            
            {error && <div className="text-destructive text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          
          <div className="text-center text-xs text-muted-foreground max-w-sm">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 