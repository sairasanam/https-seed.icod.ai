import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Field, Input, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, clearError, clearVerificationSent, forgotPassword, clearPasswordResetSent } from '@/store/slices/authSlice';
import { ArrowRight, User, Mail, Lock, CheckCircle, RefreshCw } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SeedsLogo from '@/components/SeedsLogo';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, verificationSent, passwordResetSent } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (mode === 'login') {
        await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
        navigate('/dashboard');
      } else if (mode === 'register') {
        await dispatch(register(formData)).unwrap();
        // If email is not verified, stay on page to show banner
        // Otherwise navigate
        navigate('/dashboard');
      } else if (mode === 'forgot-password') {
        await dispatch(forgotPassword(forgotPasswordEmail)).unwrap();
      }
    } catch {
      // Error is handled by the slice
    }
  };

  const fillDemoCredentials = () => {
    setFormData({ name: 'Demo User', email: 'demo@seeds.app', password: 'Seeds@1234' });
  };

  const switchToForgotPassword = () => {
    setMode('forgot-password');
    setForgotPasswordEmail(formData.email);
    dispatch(clearError());
  };

  const switchToLogin = () => {
    setMode('login');
    dispatch(clearError());
    dispatch(clearPasswordResetSent());
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4"
      data-icod-id="src_pages_auth_tsx_96e6">
      <AnimatedBackground variant="auth" data-icod-id="src_pages_auth_tsx_52c6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Premium Logo Section */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center"
            animate={!window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
              y: [0, -4, 0],
            } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <SeedsLogo
              variant="full"
              theme="dark"
              size="lg"
              data-icod-id="src_pages_auth_tsx_bc0e" />
          </motion.div>
          
          <div className="space-y-2" data-icod-id="src_pages_auth_tsx_ecd5">
            <p
              className="text-muted-foreground text-lg font-medium"
              data-icod-id="src_pages_auth_tsx_cb73">
              Nurture relationships, grow together
            </p>
          </div>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div
          layout
          className="glass-premium-brand rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Tab Switcher */}
          {mode !== 'forgot-password' && (
            <div
              className="flex gap-2 mb-8 p-1.5 bg-muted/50 rounded-2xl backdrop-blur-sm"
              data-icod-id="src_pages_auth_tsx_57f0">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setMode(tab);
                    dispatch(clearError());
                    dispatch(clearVerificationSent());
                  }}
                  className={cn(
                    'flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden',
                    mode === tab 
                      ? 'bg-gradient-to-r from-primary to-success text-white shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  data-icod-id={`src_pages_auth_tsx_9915_${tab}`}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot-password' && (
            <div className="mb-8 text-center" data-icod-id="src_pages_auth_tsx_f619">
              <h2
                className="text-xl font-bold text-foreground mb-2"
                data-icod-id="src_pages_auth_tsx_30cf">Reset Password</h2>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_auth_tsx_adbf">Enter your email to receive a reset link</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Alert variant="error" data-icod-id="src_pages_auth_tsx_31a8">{error}</Alert>
              </motion.div>
            )}
            
            {/* Verification email sent banner */}
            {verificationSent && mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Alert variant="success" data-icod-id="src_pages_auth_tsx_verify_banner">
                  <div className="flex items-start gap-3" data-icod-id="src_pages_auth_tsx_ad41">
                    <CheckCircle
                      className="h-5 w-5 shrink-0 mt-0.5"
                      data-icod-id="src_pages_auth_tsx_653a" />
                    <div data-icod-id="src_pages_auth_tsx_798b">
                      <p className="font-semibold" data-icod-id="src_pages_auth_tsx_c824">Verification email sent!</p>
                      <p className="text-sm mt-1" data-icod-id="src_pages_auth_tsx_ff3d">Please check your inbox at {formData.email} and click the verification link.</p>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}

            {/* Password reset sent banner */}
            {passwordResetSent && mode === 'forgot-password' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Alert variant="success" data-icod-id="src_pages_auth_tsx_reset_banner">
                  <div className="flex items-start gap-3" data-icod-id="src_pages_auth_tsx_8611">
                    <Mail
                      className="h-5 w-5 shrink-0 mt-0.5"
                      data-icod-id="src_pages_auth_tsx_426c" />
                    <div data-icod-id="src_pages_auth_tsx_47e1">
                      <p className="font-semibold" data-icod-id="src_pages_auth_tsx_9482">Reset link sent!</p>
                      <p className="text-sm mt-1" data-icod-id="src_pages_auth_tsx_a224">If an account exists with this email, you'll receive a password reset link shortly.</p>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-icod-id="src_pages_auth_tsx_47e5">
            {mode === 'forgot-password' ? (
              <>
                <Field label="Email Address" required data-icod-id="src_pages_auth_tsx_forgot_email">
                  <div className="relative" data-icod-id="src_pages_auth_tsx_forgot_email_wrap">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                      data-icod-id="src_pages_auth_tsx_forgot_email_icon" />
                    <Input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="pl-12"
                      data-icod-id="src_pages_auth_tsx_forgot_email_input" />
                  </div>
                </Field>

                <Button
                  type="submit"
                  loading={status === 'loading'}
                  className="w-full h-12 text-base mt-6"
                  variant="primary"
                  data-icod-id="src_pages_auth_tsx_forgot_submit">
                  Send Reset Link
                  {!status || status !== 'loading' ? <Mail className="h-5 w-5 ml-2" data-icod-id="src_pages_auth_tsx_forgot_icon" /> : null}
                </Button>

                <button
                  type="button"
                  onClick={switchToLogin}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                  data-icod-id="src_pages_auth_tsx_back_to_login">
                  Back to Sign In
                </button>
              </>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Field label="Full Name" required data-icod-id="src_pages_auth_tsx_5b67">
                        <div className="relative" data-icod-id="src_pages_auth_tsx_1fa4">
                          <User
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                            data-icod-id="src_pages_auth_tsx_a319" />
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            required
                            className="pl-12"
                            data-icod-id="src_pages_auth_tsx_730b" />
                        </div>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field label="Email" required data-icod-id="src_pages_auth_tsx_772f">
                  <div className="relative" data-icod-id="src_pages_auth_tsx_fe1c">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                      data-icod-id="src_pages_auth_tsx_02c7" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="pl-12"
                      data-icod-id="src_pages_auth_tsx_5178" />
                  </div>
                </Field>

                <Field label="Password" required data-icod-id="src_pages_auth_tsx_2446">
                  <div className="relative" data-icod-id="src_pages_auth_tsx_4ffc">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                      data-icod-id="src_pages_auth_tsx_3824" />
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-12"
                      data-icod-id="src_pages_auth_tsx_7f3a" />
                  </div>
                </Field>

                <Button
                  type="submit"
                  loading={status === 'loading'}
                  className="w-full h-12 text-base mt-6"
                  variant="primary"
                  data-icod-id="src_pages_auth_tsx_bb72">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  {!status || status !== 'loading' ? <ArrowRight className="h-5 w-5 ml-2" data-icod-id="src_pages_auth_tsx_1cc6" /> : null}
                </Button>
              </>
            )}
          </form>

          {mode === 'login' && (
            <>
              <div className="mt-4 text-center" data-icod-id="src_pages_auth_tsx_86bf">
                <button
                  type="button"
                  onClick={switchToForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  data-icod-id="src_pages_auth_tsx_forgot_link">
                  Forgot your password?
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-6 border-t border-border/30"
              >
                <p
                  className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wider"
                  data-icod-id="src_pages_auth_tsx_d8b4">
                  Demo Access
                </p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="w-full py-3 px-4 rounded-xl bg-muted/50 hover:bg-muted/70 text-sm font-medium text-foreground transition-all duration-300 flex items-center justify-center gap-2 group"
                  data-icod-id="src_pages_auth_tsx_dc4b">
                  <span className="text-primary" data-icod-id="src_pages_auth_tsx_1e25">demo@seeds.app</span>
                  <span className="text-muted-foreground" data-icod-id="src_pages_auth_tsx_9dd3">/</span>
                  <span className="text-primary" data-icod-id="src_pages_auth_tsx_35ce">Seeds@1234</span>
                  <ArrowRight
                    className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    data-icod-id="src_pages_auth_tsx_4152" />
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
        
        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground/60"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
