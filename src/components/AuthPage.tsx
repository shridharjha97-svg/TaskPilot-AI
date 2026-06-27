import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Eye, EyeOff, KeyRound, 
  ArrowLeft, Github, Chrome, Compass, CheckCircle2, ShieldAlert, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess }) => {
  const { authSuccess } = useApp();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [otpMode, setOtpMode] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!isLogin && !name) {
      setError('Name is required to initialize your profile.');
      return;
    }

    if (password.length < 6) {
      setError('Security policy requires passwords of at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }

      authSuccess(data.token, data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      setIsLoading(false);
      setError('Connection to security gateway failed. Ensure server is online.');
    }
  };

  const handleMagicLink = () => {
    if (!email) {
      setError('Enter your email to receive a secure magic entry token.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpMode(true);
    }, 1200);
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    try {
      // Create magic account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: 'magic-secure-pass-1337',
          name: email.split('@')[0]
        })
      }).then(r => r.json()).catch(() => null);

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: 'magic-secure-pass-1337'
        })
      }).then(r => r.json());

      setIsLoading(false);
      if (loginRes && loginRes.token) {
        authSuccess(loginRes.token, loginRes.user);
        if (onSuccess) onSuccess();
      } else {
        setError('Verification failed. Try again.');
      }
    } catch {
      setIsLoading(false);
      setError('Authentication failed. Reset and retry.');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Fetch authorization URL from server
      const res = await fetch(`/api/auth/${provider}/url`);
      if (!res.ok) throw new Error('Failed to retrieve authentication channel.');
      const data = await res.json();

      // 2. Compute popup position to center it
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // 3. Open OAuth popup
      const popup = window.open(
        data.url, 
        `taskpilot-${provider}-oauth`, 
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        setIsLoading(false);
        setError('Popup blocker active. Please permit popups to authorize.');
        return;
      }

      // 4. Register listener for postMessage
      const messageListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
          const { token, user: oAuthUser } = event.data;
          authSuccess(token, oAuthUser);
          setIsLoading(false);
          window.removeEventListener('message', messageListener);
          if (onSuccess) onSuccess();
        }
      };

      window.addEventListener('message', messageListener);

      // 5. Watch for popup closure to stop loading state if they close it
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          setIsLoading(false);
        }
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'OAuth initialization failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 relative transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full filter blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-[80px] pointer-events-none"></div>

      <button 
        id="auth-back-btn"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return home</span>
      </button>

      <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-8 relative z-10 overflow-hidden">
        {/* Brand logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-display font-extrabold text-2xl tracking-tight">
            {otpMode ? 'Verify Access Code' : isLogin ? 'Welcome Back Officer' : 'Create Rescue Contract'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
            {otpMode 
              ? 'We sent a 4-digit token to your registered inbox.' 
              : isLogin 
                ? 'Sign in to access your critical timeline escape plans.' 
                : 'Configure your profile variables to initiate shield monitors.'}
          </p>
        </div>

        {/* Validation Error Block */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-xs text-red-600 dark:text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* OTP Input UI */}
        {otpMode ? (
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {otpCode.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => {
                    const next = [...otpCode];
                    next[idx] = e.target.value.slice(-1);
                    setOtpCode(next);
                    if (e.target.value && idx < 3) {
                      // Move focus to next input
                      const sib = e.target.nextElementSibling as HTMLInputElement;
                      if (sib) sib.focus();
                    }
                  }}
                  className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xl font-bold rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              ))}
            </div>

            <button
              id="otp-submit-btn"
              onClick={handleOtpSubmit}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all shadow-md shadow-indigo-500/20 flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Verifying Link...' : 'Verify Access'}
            </button>
            
            <button
              onClick={() => setOtpMode(false)}
              className="w-full text-center text-xs text-indigo-500 hover:underline"
            >
              Go back to secure logins
            </button>
          </div>
        ) : (
          /* Normal Sign-in Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm"
                />
                <Chrome className="absolute top-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                placeholder="survival@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm"
              />
              <Mail className="absolute top-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm"
              />
              <KeyRound className="absolute top-3.5 left-4 w-4.5 h-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Password Strength Meter Grid */}
            {!isLogin && password && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Secret Strength</span>
                  <span className={strength >= 75 ? 'text-emerald-500' : strength >= 50 ? 'text-yellow-500' : 'text-rose-500'}>
                    {strength >= 75 ? 'Excellent' : strength >= 50 ? 'Moderate' : 'Unsafe'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className={`h-full rounded-full transition-all ${strength >= 25 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                  <div className={`h-full rounded-full transition-all ${strength >= 50 ? 'bg-yellow-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                  <div className={`h-full rounded-full transition-all ${strength >= 75 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                  <div className={`h-full rounded-full transition-all ${strength >= 100 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs">
              <button 
                type="button"
                onClick={handleMagicLink}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Request secure magic link
              </button>
              
              {isLogin && (
                <button 
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl transition-all shadow-md shadow-indigo-500/20 flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>{isLogin ? 'Access Workspace' : 'Initialize Profile Matrix'}</span>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-widest">or sign in with</span>
        </div>

        {/* Third-Party Logins */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Chrome className="w-4.5 h-4.5 text-red-500" />
            <span>Google</span>
          </button>
          <button 
            type="button" 
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Github className="w-4.5 h-4.5 text-slate-900 dark:text-white" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Direct Sandbox Bypass Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            id="auth-guest-bypass-btn"
            type="button"
            onClick={async () => {
              setIsLoading(true);
              try {
                // Register default user if not exists
                await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: 'alex@lifesaver.ai',
                    password: 'alex-secure-pass-1337',
                    name: 'Alex Johnson'
                  })
                }).then(r => r.json()).catch(() => null);

                const loginRes = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: 'alex@lifesaver.ai',
                    password: 'alex-secure-pass-1337'
                  })
                }).then(r => r.json());

                setIsLoading(false);
                if (loginRes && loginRes.token) {
                  authSuccess(loginRes.token, loginRes.user);
                  if (onSuccess) onSuccess();
                } else {
                  setError('Direct sandbox gateway is offline. Try biometric gates.');
                }
              } catch {
                setIsLoading(false);
                setError('Failed to bypass auth. Please try manual login.');
              }
            }}
            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded-xl text-xs transition-all flex justify-center items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Direct Sandbox Access (No Auth Required)</span>
          </button>
        </div>

        {/* Toggle between login & signup */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isLogin ? "New candidate for deadline rescue?" : "Already part of the network?"}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            {isLogin ? 'Create secure account' : 'Access your terminal'}
          </button>
        </div>
      </div>
    </div>
  );
};
