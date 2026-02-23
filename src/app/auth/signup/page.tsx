'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordRequirements from '@/components/PasswordRequirements';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          ...(firstName.trim() && { first_name: firstName.trim() }),
          ...(lastName.trim() && { last_name: lastName.trim() }),
        }),
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

      setSuccess('Account created successfully! Redirecting to login...');
      setEmail('');
      setUsername('');
      setFirstName('');
      setLastName('');
      setPassword('');

      // Redirect to login page, preserving the redirect URL
      setTimeout(() => {
        const loginUrl = redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login';
        router.push(loginUrl);
      }, 1500);
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
          <h1 className="text-4xl font-bold text-gray-800">Créer un compte</h1>
          <p className="mt-2 text-gray-600">Rejoignez l&apos;aventure Secret Santa !</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && <div className="p-4 text-green-800 bg-green-100 border border-green-200 rounded-md">{success}</div>}
          {error && <div className="p-4 text-red-800 bg-red-100 border border-red-200 rounded-md">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="jean_dupont"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Prénom <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="Jean"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Nom <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="Dupont"
              />
            </div>
          </div>


          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mot de passe
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
            <PasswordRequirements password={password} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="font-medium text-red-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
