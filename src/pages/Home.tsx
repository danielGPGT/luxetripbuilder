import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/AuthProvider';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  Star, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Plane,
  Heart,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';
import img4 from "@/assets/imgs/igor-oliyarnik-Uu5aXBI1oLk-unsplash.jpg";

export function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Planning",
      description: "Our advanced AI creates personalized luxury itineraries in minutes, not hours.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Destinations",
      description: "Access to thousands of destinations with insider knowledge and local expertise.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Generate complete itineraries with pricing, recommendations, and bookings in seconds.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Luxury Focused",
      description: "Curated experiences for discerning travelers who expect the very best.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Luxury Travel Agent",
      avatar: "SJ",
      content: "LuxeTripBuilder has revolutionized how I create itineraries. My clients are amazed by the level of detail and personalization.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Corporate Travel Manager",
      avatar: "MC",
      content: "The AI suggestions are spot-on. I've saved countless hours while delivering better experiences for my clients.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Independent Travel Consultant",
      avatar: "ER",
      content: "This tool has helped me scale my business. The luxury focus and attention to detail are exactly what my clients need.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Itineraries Created", icon: <Plane className="h-6 w-6" /> },
    { number: "500+", label: "Happy Clients", icon: <Users className="h-6 w-6" /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Heart className="h-6 w-6" /> },
    { number: "50+", label: "Countries Covered", icon: <Globe className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-purple-600 text-white pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={img4}
            alt="Luxury travel destination"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 via-[var(--primary)]/25 to-purple-600/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Luxury Travel Planning
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create Stunning
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Luxury Itineraries
              </span>
              in Minutes
        </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Transform your travel planning with AI-powered luxury itineraries. 
              Personalized experiences, detailed pricing, and professional presentations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                      Watch Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-[var(--primary)]/10 rounded-full">
                  <div className="text-[var(--primary)]">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-[var(--foreground)] mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LuxeTripBuilder?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of luxury travel planning with our cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-muted/50">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied travel professionals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--primary)] to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Travel Business?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travel professionals who are already using LuxeTripBuilder to create amazing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                    Schedule Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">LuxeTripBuilder</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered luxury travel itinerary builder for professionals.
              </p>
              <div className="flex gap-4">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <Phone className="h-5 w-5 text-muted-foreground" />
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row justify-between items-center text-muted-foreground">
            <p>&copy; 2024 LuxeTripBuilder. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 