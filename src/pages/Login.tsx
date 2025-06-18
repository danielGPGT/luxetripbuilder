import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import LuxeLogo from "@/assets/Luxe.svg";
import img1 from "@/assets/imgs/james-donaldson-toPRrcyAIUY-unsplash.jpg";
import img2 from "@/assets/imgs/fredrik-ohlander-fCW1hWq2nq0-unsplash.jpg";
import img3 from "@/assets/imgs/spencer-davis-Ivwyqtw3PzU-unsplash.jpg";
import img4 from "@/assets/imgs/igor-oliyarnik-Uu5aXBI1oLk-unsplash.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const carouselImages = [img1, img2, img3, img4];

export default function Login() {
  const { user, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Optional: auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
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
          <img
            src={carouselImages[carouselIdx]}
            alt="Travel background"
            className="w-full h-full object-cover opacity-40 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
        </div>
        {/* Top content */}
        <div className="relative flex flex-col space-y-6 z-10 mt-8">
          <img src={LuxeLogo} className="h-12 w-auto" alt="LuxeTripBuilder Logo" />
          <h2 className="text-4xl font-bold leading-tight mt-8">
            Tailor-made Luxury Travel
          </h2>
          <p className="text-lg text-gray-200 max-w-md">
            Welcome to LuxeTripBuilder — your gateway to exclusive, AI-powered luxury travel experiences.
          </p>
        </div>
        {/* Bottom quote */}
        <div className="relative text-sm text-gray-300 mt-8 z-10 mb-4">
          <p className="italic">
            "Travel smarter. Dream bigger. Experience luxury like never before."
          </p>
          <p className="mt-4 font-semibold">LuxeTripBuilder</p>
        </div>
        {/* Carousel controls */}
        <div className="absolute left-0 right-0 bottom-8 flex justify-center gap-2 z-20">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${carouselIdx === idx ? 'bg-white' : 'bg-white/40'}`}
              onClick={() => setCarouselIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md space-y-6 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <img src={LuxeLogo} alt="LuxeTripBuilder Logo" className="h-12 mb-6 lg:hidden" />
          <h1 className="text-2xl font-bold text-center text-indigo-700">
            Sign in to your account
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Enter your email and password to access your account
          </p>
          <form onSubmit={handleLogin} className="space-y-4 w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            By signing in, you agree to our {" "}
            <a href="/terms" className="underline">
              Terms of Service
            </a>{" "}
            and {" "}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 