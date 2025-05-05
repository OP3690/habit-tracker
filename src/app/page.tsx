'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Select from 'react-select';

type Country = {
  name: string;
  isoCode: string;
  dialCode: string;
  flagEmoji?: string;
  flagSvgUrl?: string;
};

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const filteredCountries: Country[] = countries.filter((country: Country) => {
    if (!countrySearch) return true;
    const search = countrySearch.trim().toLowerCase();
    if (search.startsWith('+') || /^\d+$/.test(search)) {
      return country.dialCode.replace('+', '').startsWith(search.replace('+', ''));
    }
    return (
      country.name.toLowerCase().includes(search) ||
      country.isoCode.toLowerCase().includes(search)
    );
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    countryCode: '+91',
    countryIsoCode: 'IN',
    countryName: 'India',
    mobile: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data: Country[]) => {
        setCountries(data);
        // Set default to India if present
        const india = data.find((c: Country) => c.dialCode === '+91');
        if (india) {
          setFormData(f => ({
            ...f,
            countryCode: india.dialCode,
            countryIsoCode: india.isoCode,
            countryName: india.name,
          }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Register new user
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Show success message
        setSuccess('Account created successfully! Please sign in.');
        // Switch to sign in mode after 2 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setFormData({ ...formData, name: '' });
        }, 2000);
        return;
      }

      // Sign in
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const countryOptions = countries.map((country) => ({
    value: country.isoCode,
    label: `${country.flagEmoji} ${country.dialCode} (${country.isoCode})`,
    country: country,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
      <div className="w-full h-screen flex">
        {/* Left side - App info (60%) */}
        <div className="hidden lg:flex w-[60%] flex-col justify-between p-16 relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/kike-vega-F2qh3yjz6Jk-unsplash.jpg"
              alt="Habit Tracker Dashboard"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 mt-8">
            <div className="inline-block">
              <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Habit Tracker
              </h1>
              <div className="h-1 w-24 bg-green-500 rounded-full mb-8"></div>
            </div>
            <p className="text-2xl text-white/90 mb-8 max-w-xl leading-relaxed drop-shadow-lg">
              Transform your life one habit at a time
            </p>
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-white drop-shadow-sm">Track your daily habits effortlessly</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-white drop-shadow-sm">Set and achieve your personal goals</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-white drop-shadow-sm">Monitor your progress with insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form (40%) */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm">
          <div className="w-full max-w-md p-8">
            <h2 className="text-3xl font-bold text-center mb-2">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-center text-gray-600 mb-8">
              {isSignUp ? 'Start your journey to better habits' : 'Continue your journey to better habits'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <>
                  <div className="relative group">
                    <UserIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 group-hover:bg-white transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="w-1/3">
                      <Select
                        options={countryOptions}
                        defaultValue={countryOptions.find(opt => opt.country.dialCode === '+91')}
                        onChange={(selected: any) => {
                          if (!selected) return;
                          setFormData({
                            ...formData,
                            countryCode: selected.country.dialCode,
                            countryIsoCode: selected.country.isoCode,
                            countryName: selected.country.name,
                          });
                        }}
                        isSearchable
                        classNamePrefix="react-select"
                        className="w-full"
                        styles={{
                          control: (base: any) => ({
                            ...base,
                            minHeight: '48px',
                            borderRadius: '0.75rem',
                            borderColor: '#e5e7eb',
                            boxShadow: 'none',
                          }),
                        }}
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, mobile: value });
                      }}
                      className="flex-1 pl-3 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
                      required
                      maxLength={formData.countryCode === '+91' ? 10 : 15}
                      minLength={formData.countryCode === '+91' ? 10 : 5}
                      pattern={formData.countryCode === '+91' ? '\\d{10}' : '[0-9]+'}
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 group-hover:bg-white transition-colors"
                  required
                />
              </div>

              <div className="relative group">
                <LockClosedIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="password"
                  placeholder="Password (minimum 8 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 group-hover:bg-white transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-medium transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUp ? 'Sign Up' : 'Sign In'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setFormData({ name: '', email: '', password: '', countryCode: '+91', countryIsoCode: 'IN', countryName: 'India', mobile: '' });
                }}
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
