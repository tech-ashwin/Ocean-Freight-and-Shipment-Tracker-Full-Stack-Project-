import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Layers,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  ArrowRight,
  Database,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { UserAccount } from '../types';
import { loginUser, registerUser, forgotPassword } from '../utils/auth';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('bluspark_remembered_user') || 'ashwingupta2027@gmail.com';
  });
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('ashwingupta2027@gmail.com');
  const [forgotFeedback, setForgotFeedback] = useState<string | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please provide both your email/username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rememberMe) {
        localStorage.setItem('bluspark_remembered_user', username.trim());
      } else {
        localStorage.removeItem('bluspark_remembered_user');
      }

      const result = await loginUser(username.trim(), password);
      setSuccessMessage('Authentication verified! Redirecting to workspace...');
      setTimeout(() => {
        onLogin(result.user);
      }, 350);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Login failed. Please verify your credentials or use a quick demo account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !registerEmail.trim() || !registerPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser(fullName.trim(), registerEmail.trim(), registerPassword);
      setSuccessMessage('Account registered successfully! Launching workspace...');
      setTimeout(() => {
        onLogin(result.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. The email might already be registered.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleQuickLogin = (email: string, pass: string = 'password123') => {
    setUsername(email);
    setPassword(pass);
    setErrorMessage(null);
    setIsSubmitting(true);
    loginUser(email, pass)
      .then((res) => {
        setSuccessMessage(`Signed in as ${res.user.name}!`);
        setTimeout(() => onLogin(res.user), 300);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Quick login failed');
        setIsSubmitting(false);
      });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSubmitting(true);
    setForgotFeedback(null);
    try {
      const msg = await forgotPassword(forgotEmail);
      setForgotFeedback(msg || 'Password reset instructions have been dispatched.');
    } catch (err: any) {
      setForgotFeedback(err.message || 'Unable to dispatch reset email.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch select-none font-sans">
      {/* BEGIN: LeftHeroSection */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900 text-white select-none">
        {/* Background Cargo Ship Image */}
        <img
          alt="Ocean Freight Cargo Ship"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlE_dIhOWnk56YLlacenkwj8WkPnLb8zBG61nhw3gdw4uIR3gyj81IESiO0Di9CAq5ubRXrsEb5uZttWAL8vYDuqr5y4YbtXdkm20kPPRonZPjWbQpSLiSzOqdGfHNRJRIP3PrIGDDD31r7D0iKquIFUmg9xsIDK2iuOcdVWt3GXuR9Dhel1aqm3z6ile7NRhhFXsq-nehbErlH4_CCsqTwfBhqIIDxpKiQP8HyFIFxKxax8_xeBdR"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Gradient Overlay replicating the deep ocean blue hue */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(16, 52, 102, 0.94) 0%, rgba(14, 40, 77, 0.72) 45%, rgba(10, 28, 55, 0.96) 100%)',
          }}
        />

        {/* Top Branding: Logo & Brand Name */}
        <div className="relative z-10 p-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-sky-400 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider text-white">BLUSPARK</span>
              <span className="text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
                Ocean Freight Platform
              </span>
            </div>
          </div>


        </div>

        {/* Center/Bottom Titles */}
        <div className="relative z-10 px-12 pb-16 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-medium border border-blue-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Integrated Logistics OS
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3 drop-shadow-md">
            Ocean Freight and
            <br />
            Shipment Tracker
          </h1>
          <p className="text-base xl:text-lg font-normal text-slate-200 tracking-wide drop-shadow">
            Smarter Shipping. Better Decisions.
          </p>

          {/* Quick specs pill row */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-blue-100 font-medium">
            <span className="bg-blue-900/60 backdrop-blur-xs px-3 py-1.5 rounded-md border border-blue-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Rate Search Engine
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-3 py-1.5 rounded-md border border-blue-400/30 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Persistent REST DB
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-3 py-1.5 rounded-md border border-blue-400/30 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-300" />
              Email Ingestion
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-3 py-1.5 rounded-md border border-blue-400/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Invoice Audit
            </span>
          </div>
        </div>

        {/* Decorative accent line at bottom */}
        <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-80" />
      </section>
      {/* END: LeftHeroSection */}

      {/* BEGIN: RightAuthSection */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white min-h-screen overflow-y-auto">
        <div className="w-full max-w-[430px] mx-auto py-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight">BLUSPARK</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Ocean Freight OS
                </span>
              </div>
            </div>

          </div>

          {/* Auth Header Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isRegisterMode
                ? 'Register for the BLUSPARK ocean freight workspace'
                : 'Sign in to continue to your logistics operations workspace'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Authentication Alert</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-5 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition cursor-pointer text-center ${
                !isRegisterMode
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition cursor-pointer text-center ${
                isRegisterMode
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* LOGIN FORM */}
          {!isRegisterMode ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              {/* Field 1: Email / Username */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="username">
                  Email / Username
                </label>
                <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    className="block w-full border-0 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                    id="username"
                    name="username"
                    placeholder="operator@bluspark.com"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    className="block w-full border-0 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Remember me */}
              <div className="flex items-center pt-1 pb-1">
                <input
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="ml-2 block text-xs text-slate-600 select-none cursor-pointer"
                  htmlFor="remember-me"
                >
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  className="w-full py-2.5 px-4 bg-[#14233c] hover:bg-[#0c1626] active:bg-[#080e18] text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    className="block w-full border-0 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Ashwin Gupta"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-slate-700 mb-1"
                  htmlFor="registerEmail"
                >
                  Work Email
                </label>
                <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    className="block w-full border-0 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                    id="registerEmail"
                    name="registerEmail"
                    placeholder="user@bluspark.com"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-slate-700 mb-1"
                    htmlFor="registerPassword"
                  >
                    Password
                  </label>
                  <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                    <input
                      className="block w-full border-0 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                      id="registerPassword"
                      name="registerPassword"
                      placeholder="Min 6 chars"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-slate-700 mb-1"
                    htmlFor="confirmPassword"
                  >
                    Confirm
                  </label>
                  <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition bg-white">
                    <input
                      className="block w-full border-0 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account in DB...</span>
                    </>
                  ) : (
                    <>
                      <span>Register &amp; Enter Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}



          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Quick Demo Access
              </span>
              <span className="text-[11px] text-slate-400">Password: password123</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ashwingupta2027@gmail.com')}
                disabled={isSubmitting}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  Ashwin Gupta
                </div>
                <div className="text-[10px] text-slate-500 truncate">Logistics Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator@bluspark.com')}
                disabled={isSubmitting}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  Operator
                </div>
                <div className="text-[10px] text-slate-500 truncate">Full Ops</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@bluspark.com')}
                disabled={isSubmitting}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  Analyst
                </div>
                <div className="text-[10px] text-slate-500 truncate">Rates &amp; Audits</div>
              </button>
            </div>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegisterMode ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to BLUSPARK?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
      {/* END: RightAuthSection */}

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 relative animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotFeedback(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                <p className="text-xs text-slate-500">Enter your email for access instructions</p>
              </div>
            </div>

            {forgotFeedback ? (
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <p className="font-semibold mb-1">Status Update</p>
                <p>{forgotFeedback}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setForgotFeedback(null);
                    }}
                    className="px-3.5 py-1.5 rounded-md bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="forgotEmail">
                    Account Email
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. ashwingupta2027@gmail.com"
                    required
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Quick Hint:</span> Preconfigured demo
                  accounts (Ashwin Gupta, Operator, Analyst) use the password{' '}
                  <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">
                    password123
                  </code>
                  .
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isForgotSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Request Reset</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
