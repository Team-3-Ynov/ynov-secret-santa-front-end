'use client';

import { useState } from 'react';
import Link from 'next/link';
import PasswordRequirements from '@/components/PasswordRequirements';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = 'An unknown error occurred.';
        if (result.errors && Array.isArray(result.errors)) {
          errorMessage = result.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ');
        } else if (Array.isArray(result.message)) {
          errorMessage = result.message.join(', ');
        } else if (result.message) {
          errorMessage = result.message;
        }
        throw new Error(errorMessage);
      }

      setSuccess('Account created successfully! You can now log in.');
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Create an Account</h1>
          <p className="mt-2 text-gray-600">Join the Secret Santa fun!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && <div className="p-4 text-green-800 bg-green-100 border border-green-200 rounded-md">{success}</div>}
          {error && <div className="p-4 text-red-800 bg-red-100 border border-red-200 rounded-md">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <PasswordRequirements password={password} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-red-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

