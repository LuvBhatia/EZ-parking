import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get role from URL params if present
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam && ["user", "owner"].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(username, email, password, role);
      toast({
        title: "Registration Successful",
        description: "Welcome to Smart Parking!",
        variant: "default",
      });
      
      // Redirect based on role
      if (role === "user") {
        setLocation("/dashboard");
      } else if (role === "owner") {
        setLocation("/owner");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
                <Car className="text-white text-3xl" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600 text-base mt-2">
              Join Smart Parking and start your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                  placeholder="Choose a username"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                  placeholder="Enter your email"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                  placeholder="Create a strong password"
                  data-testid="input-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 font-medium">Account Type</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500" data-testid="select-role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">🚗 Car Owner (Find Parking)</SelectItem>
                    <SelectItem value="owner">🏢 Parking Owner (Rent Space)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-base shadow-lg transition-all duration-200 transform hover:scale-[1.02] mt-6" 
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors" data-testid="link-login">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
