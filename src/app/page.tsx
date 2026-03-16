"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const token = localStorage.getItem("token");
    startTransition(() => {
      setIsLoggedIn(!!token);
    });
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="text-gray-900">Organisez votre </span>
              <span className="text-red-600">Secret Santa</span>
              <span className="text-gray-900"> en toute simplicité</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Créez des événements, invitez vos amis, collègues ou famille, et laissez la magie de
              Noël opérer ! Notre plateforme gère le tirage au sort pour vous. 🎄
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/secretsanta/create"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    🎁 Créer un événement
                  </Link>
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-red-600 text-lg font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    📋 Voir mes événements
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    🚀 Commencer gratuitement
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-red-600 text-lg font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Flocons décoratifs */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">❄️</div>
        <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse">⭐</div>
        <div className="absolute bottom-10 left-1/4 text-5xl opacity-20">🎄</div>
        <div className="absolute bottom-20 right-1/4 text-4xl opacity-20 animate-bounce">🎁</div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Trois étapes simples pour organiser votre Secret Santa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-8 rounded-2xl bg-linear-to-br from-red-50 to-white border border-red-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-3xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Créez votre événement</h3>
              <p className="text-gray-600">
                Définissez le nom, la date et le budget maximum pour les cadeaux de votre Secret
                Santa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-8 rounded-2xl bg-linear-to-br from-green-50 to-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Invitez les participants</h3>
              <p className="text-gray-600">
                Partagez le lien d&apos;invitation avec vos amis, collègues ou membres de votre
                famille.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-8 rounded-2xl bg-linear-to-br from-yellow-50 to-white border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 text-3xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lancez le tirage !</h3>
              <p className="text-gray-600">
                Notre système effectue le tirage au sort et chaque participant découvre qui il doit
                gâter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-linear-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à répandre la joie de Noël ? 🎅
          </h2>
          <p className="text-xl text-red-100 mb-10">
            Rejoignez des milliers d&apos;utilisateurs qui organisent leurs Secret Santa avec nous.
          </p>
          {isLoggedIn ? (
            <Link
              href="/secretsanta/create"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 shadow-lg transition-all"
            >
              Créer mon Secret Santa
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 shadow-lg transition-all"
            >
              S&apos;inscrire maintenant
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl mb-4">🎅 Secret Santa</p>
          <p className="text-sm">
            © {new Date().getFullYear()} Secret Santa. Fait avec ❤️ pour répandre la joie des fêtes.
          </p>
        </div>
      </footer>
    </div>
  );
}
