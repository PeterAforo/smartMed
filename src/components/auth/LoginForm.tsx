import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import nchsLogo from '@/assets/nchs-logo.png';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Demo logic - in real app, this would be API-driven
      if (email === 'admin@nchs.com' && password === 'admin123') {
        setShowTwoFactor(true);
        toast({
          title: "Authentication Code Required",
          description: "Please enter your 2FA code to complete login.",
        });
      } else {
        setError('Invalid email or password. Try admin@nchs.com / admin123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate 2FA verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (twoFactorCode === '123456') {
        // Store auth state (in real app, use proper JWT)
        localStorage.setItem('nchs_auth', 'true');
        localStorage.setItem('nchs_user', JSON.stringify({
          id: '1',
          email: 'admin@nchs.com',
          name: 'System Administrator',
          role: 'admin',
          permissions: ['all']
        }));
        
        toast({
          title: "Login Successful",
          description: "Welcome to NCHS Hospital Management System!",
        });
        
        navigate('/dashboard');
      } else {
        setError('Invalid 2FA code. Try 123456 for demo.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary-light/20 to-background p-4">
      <Card className="w-full max-w-md healthcare-card border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={nchsLogo} 
              alt="NCHS Hospital Management System" 
              className="h-16 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              NCHS Hospital Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {showTwoFactor ? 'Enter your authentication code' : 'Sign in to your account'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-destructive/20 bg-destructive-light">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!showTwoFactor ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@nchs.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full healthcare-gradient text-primary-foreground font-medium py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twoFactor" className="text-foreground font-medium">
                  Two-Factor Authentication Code
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twoFactor"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="pl-10 border-border bg-background text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Demo code: 123456
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTwoFactor(false);
                    setTwoFactorCode('');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 healthcare-gradient text-primary-foreground font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p className="text-xs">Email: admin@nchs.com | Password: admin123 | 2FA: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}