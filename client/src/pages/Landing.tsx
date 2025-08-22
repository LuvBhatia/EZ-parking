import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Car, Building, Clock, Shield, Smartphone } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-primary">Smart Parking System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">Login</Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-register">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Find Perfect Parking Spots Instantly</h2>
              <p className="text-xl mb-8">Book, pay, and park with ease. Join thousands of users and parking owners in India's smartest parking network.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=user">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary-dark" data-testid="button-find-parking">
                    <Car className="mr-2" size={20} />
                    Find Parking
                  </Button>
                </Link>
                <Link href="/register?role=owner">
                  <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100" data-testid="button-list-space">
                    <Building className="mr-2" size={20} />
                    List Your Space
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Smart Parking?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience hassle-free parking with our comprehensive platform designed for users, owners, and administrators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Real-Time Availability</h4>
              <p className="text-gray-600">See available parking spots in real-time and book instantly for your preferred duration.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-success bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-success text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure Payments</h4>
              <p className="text-gray-600">Safe and secure payment processing with detailed receipts in Indian Rupees (₹).</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-secondary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-secondary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Easy Management</h4>
              <p className="text-gray-600">Intuitive dashboards for users to book and owners to manage their parking spaces.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
