import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Eye, EyeOff, Shield, Info, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [pendingLogin, setPendingLogin] = useState<{ username: string; role: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageVerified) {
      toast({
        title: 'Age Verification Required',
        description: 'Please confirm you are 21+ to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = login(username, password);

    if (result.success) {
      // Show 2FA modal
      setPendingLogin({
        username,
        role: username === 'admin' ? 'admin' : 'user',
      });
      setShow2FA(true);
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handle2FASubmit = () => {
    if (otpValue.length === 6) {
      setShow2FA(false);
      toast({
        title: 'Welcome aboard, Captain! ⚓',
        description: 'Successfully logged in.',
      });

      if (pendingLogin?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary"
          >
            <Skull className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">Pirate Parlays</h1>
          <p className="text-muted-foreground mt-2">MVP Demo • No Real Money</p>
        </div>

        <Card className="glass-strong border-border/50">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full bg-muted/50">
                <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                <TabsTrigger value="create" className="flex-1">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Checkbox
                      id="age"
                      checked={ageVerified}
                      onCheckedChange={(checked) => setAgeVerified(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="age" className="text-sm font-medium cursor-pointer">
                        Age & KYC Verification
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I confirm I am 21+ years old and agree to identity verification.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-primary-foreground font-semibold h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Skull className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      'Continue'
                    )}
                  </Button>

                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="create" className="mt-6 space-y-4">
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Account creation is disabled in this demo.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use demo credentials below to explore the app.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Demo Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mt-4 glass border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Demo Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">User:</span>
                <code className="font-mono bg-muted px-2 py-0.5 rounded">user / 1234u</code>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Admin:</span>
                <code className="font-mono bg-muted px-2 py-0.5 rounded">admin / 1234a</code>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo only. No real-money gambling.
        </p>
      </motion.div>

      {/* 2FA Modal */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-center">
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground text-center">
              For demo purposes, enter any 6 digits.
            </p>
            <Button
              onClick={handle2FASubmit}
              disabled={otpValue.length !== 6}
              className="w-full gradient-primary text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              Verify & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
