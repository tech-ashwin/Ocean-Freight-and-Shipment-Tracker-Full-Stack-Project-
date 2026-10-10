import React, { useState } from 'react';
import { User, Lock, Layers } from 'lucide-react';
import { UserAccount } from '../types';
import { loginApi } from '../utils/api';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Ashwin Gupta');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await loginApi(username, password);
      onLogin(result.user);
    } catch {
      onLogin({
        name: username || 'Ashwin Gupta',
        email:
          username.toLowerCase().includes('@')
            ? username
            : 'ashwingupta2027@gmail.com',
        role: 'User',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    onLogin({
      name: 'Ashwin Gupta',
      email: 'ashwingupta2027@gmail.com',
      role: 'User',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch select-none">
      {/* BEGIN: LeftHeroSection */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900 text-white select-none">
        {/* Background Cargo Ship Image */}
        <img
          alt="Ocean Freight Cargo Ship"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlE_dIhOWnk56YLlacenkwj8WkPnLb8zBG61nhw3gdw4uIR3gyj81IESiO0Di9CAq5ubRXrsEb5uZttWAL8vYDuqr5y4YbtXdkm20kPPRonZPjWbQpSLiSzOqdGfHNRJRIP3PrIGDDD31r7D0iKquIFUmg9xsIDK2iuOcdVWt3GXuR9Dhel1aqm3z6ile7NRhhFXsq-nehbErlH4_CCsqTwfBhqIIDxpKiQP8HyFIFxKxax8_xeBdR"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Elegant fallback background if external image fails
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Gradient Overlay replicating the deep ocean blue hue */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(16, 52, 102, 0.92) 0%, rgba(14, 40, 77, 0.65) 45%, rgba(10, 28, 55, 0.95) 100%)',
          }}
        />

        {/* Top Branding: Logo & Brand Name */}
        <div className="relative z-10 p-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-sky-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider text-white">BLUSPARK</span>
            <span className="text-[10px] uppercase tracking-widest text-sky-300 font-medium">Ocean Freight Platform</span>
          </div>
        </div>

        {/* Center/Bottom Titles */}
        <div className="relative z-10 px-12 pb-16 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3 drop-shadow-md">
            Ocean Freight and
            <br />
            Shipment Tracker
          </h1>
          <p className="text-base xl:text-lg font-normal text-slate-200 tracking-wide drop-shadow">
            Smarter Shipping. Better Decisions.
          </p>

          {/* Quick specs pill row */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-blue-200/90 font-medium">
            <span className="bg-blue-900/60 backdrop-blur-xs px-2.5 py-1 rounded border border-blue-400/30">
              Rate Search Engine
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-2.5 py-1 rounded border border-blue-400/30">
              Auto Delay Tracking
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-2.5 py-1 rounded border border-blue-400/30">
              Email Extraction
            </span>
            <span className="bg-blue-900/60 backdrop-blur-xs px-2.5 py-1 rounded border border-blue-400/30">
              Invoice Audit
            </span>
          </div>
        </div>

        {/* Decorative accent line at bottom */}
        <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-60" />
      </section>
      {/* END: LeftHeroSection */}

      {/* BEGIN: RightAuthSection */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">BLUSPARK</span>
          </div>

          {/* Auth Header Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Field 1: Email / Username */}
            <div data-purpose="field-username">
              <label
                className="block text-xs font-medium text-slate-600 mb-1"
                htmlFor="username"
              >
                Email / Username
              </label>
              <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  className="block w-full border-0 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                  id="username"
                  name="username"
                  placeholder="Enter email or username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div data-purpose="field-password">
              <label
                className="block text-xs font-medium text-slate-600 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative rounded-lg border border-slate-300 shadow-xs focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  className="block w-full border-0 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-0 rounded-lg bg-transparent"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                className="w-full py-2.5 px-4 bg-[#14233c] hover:bg-[#0c1626] active:bg-[#080e18] text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150 flex items-center justify-center cursor-pointer"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>

          {/* Divider: Or continue with */}
          <div className="relative my-6">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-normal">
                Or continue with
              </span>
            </div>
          </div>

          {/* Third-Party Auth: Google */}
          <div>
            <button
              className="w-full py-2 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-xs flex items-center justify-center gap-2.5 transition duration-150 cursor-pointer"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              New customer?{' '}
              <button
                type="button"
                onClick={handleSubmit}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </main>
      {/* END: RightAuthSection */}
    </div>
  );
};
