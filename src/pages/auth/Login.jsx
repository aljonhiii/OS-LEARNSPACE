import React, { useState } from 'react';
import { 
  GraduationCap, Lock, Mail, Eye, EyeOff, ArrowRight, 
  AlertCircle, KeyRound, CheckCircle2, Loader2,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      setForgotSuccessMessage(data.message || 'Password reset request submitted.');
    } catch (err) {
      setForgotSuccessMessage('If an institutional account matches that address, password reset instructions have been issued.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-blue-200">
      
      {/* LEFT COLUMN: Modern Product Showcase (Desktop only, 50% width) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center">
          <BrandLogo variant="white" className="h-11" />
        </div>

        {/* Center: Single Clean Preview Card with Skeleton Only */}
        <div className="relative z-10 my-auto py-8 max-w-lg w-full">
          
          {/* Main Floating Preview Card */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 bg-slate-700/50 border border-slate-600/50 px-3 py-1 rounded-full tracking-wider uppercase font-sans">
                Upcoming Class
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>4.8 Rating</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Skeleton Profile Picture with Subject Person & Subject */}
              <div className="flex items-center gap-3.5">
                {/* Skeleton Profile Picture Placeholder matching uploaded asset */}
                <div className="w-12 h-12 rounded-full bg-[#182338] border border-[#263857] flex items-center justify-center shrink-0">
                  <div className="w-8 h-8 rounded-full border border-[#33486c] flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#3e567f]"></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">
                    Jane Cooper
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    UI/UX Design Systems (UXD-201)
                  </p>
                </div>
              </div>

              {/* Countdown Pill matching reference */}
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-lg text-blue-300 block">
                  02:25:03
                </span>
                <span className="text-[10px] text-slate-400 block">
                  starts in
                </span>
              </div>
            </div>

            {/* Course Progress Bar */}
            <div className="pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Course Completion</span>
                <span className="text-blue-400 font-semibold font-mono">82%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-[82%] h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>

          </div>

          {/* Headline & Subtitle */}
          <div className="mt-8 space-y-2">
            <h1 className="font-heading text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              A cleaner way to learn and teach.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Everything you need to manage courses, evaluate submissions, and track academic progress in one unified portal.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800">
          <span>LearnSpace Learning Management System</span>
          <span>Campus Portal</span>
        </div>

      </div>

      {/* RIGHT COLUMN: Clean, Focused Authentication (50% on desktop) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 bg-white">
        
        {/* Mobile-only header brand */}
        <div className="lg:hidden flex items-center mb-6">
          <BrandLogo variant="dark" className="h-10" />
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto space-y-6">
          
          <div className="hidden lg:block">
            <BrandLogo variant="dark" className="h-10" />
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@learnspace.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotEmail(email); setForgotSuccessMessage(''); }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500/30 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Help Footnote */}
          <div className="pt-4 text-center">
            <p className="text-xs text-slate-400">
              Need account assistance? Contact your campus administrator.
            </p>
          </div>

        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} LearnSpace. All rights reserved.
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-lg">
              Reset Your Password
            </h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Enter your registered email address and we'll send password recovery instructions.
            </p>

            {forgotSuccessMessage ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{forgotSuccessMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Return to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="forgotEmail">
                    Email address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@learnspace.edu"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Submitting...' : 'Send reset link'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
