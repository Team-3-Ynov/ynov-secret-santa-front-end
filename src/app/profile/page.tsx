"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProfileAvatarPicker from "@/components/ProfileAvatarPicker";
import {
  getProfileAvatar,
  isValidProfileAvatarImage,
  type ProfileAvatarImage,
} from "@/constants/profileAvatars";

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: ProfileAvatarImage;
  createdAt?: string;
  stats?: {
    eventsCreated: number;
    participations: number;
    giftsOffered: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    profileImage: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            router.push("/auth/login");
            return;
          }
          throw new Error("Erreur lors de la récupération du profil");
        }

        const result = await res.json();
        const apiUser = result.data?.user || result.data;

        // Map backend snake_case to frontend camelCase
        const selectedAvatar = getProfileAvatar(apiUser.profile_image);
        const userData: User = {
          id: String(apiUser.id),
          email: apiUser.email,
          username: apiUser.username,
          firstName: apiUser.first_name,
          lastName: apiUser.last_name,
          profileImage: selectedAvatar?.src,
          createdAt: apiUser.created_at,
          stats: apiUser.stats,
        };

        setUser(userData);
        setFormData({
          username: userData.username || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          profileImage: userData.profileImage || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      setFormData({
        username: user?.username || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        profileImage: user?.profileImage || "",
      });
    }
    setError("");
    setIsEditing(!isEditing);
    setSaveSuccess(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Prevent multiple simultaneous save operations
    if (isSaving) return;

    setIsSaving(true);
    setError("");

    if (!isValidProfileAvatarImage(formData.profileImage)) {
      setError("Veuillez sélectionner une image de profil valide.");
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const res = await fetch(`${apiUrl}/api/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          profile_image: formData.profileImage,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          router.push("/auth/login");
          return;
        }
        const result = await res.json();
        throw new Error(result.message || "Erreur lors de la mise à jour du profil");
      }

      const result = await res.json();
      const apiUser = result.data.user;
      const selectedAvatar = getProfileAvatar(apiUser.profile_image);

      const updatedUserData: User = {
        id: String(apiUser.id),
        email: apiUser.email,
        username: apiUser.username,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        profileImage: selectedAvatar?.src || formData.profileImage,
        createdAt: apiUser.created_at,
        stats: user?.stats, // Keep existing stats if not returned by update
      };

      setUser(updatedUserData);
      setFormData({
        username: updatedUserData.username || "",
        firstName: updatedUserData.firstName || "",
        lastName: updatedUserData.lastName || "",
        profileImage: updatedUserData.profileImage || "",
      });
      setIsEditing(false);
      setSaveSuccess(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        // Call logout endpoint
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {
          // Ignore errors, we'll clear local storage anyway
        });
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  const getInitials = (user?: User | null) => {
    const firstName = user?.firstName?.trim();
    const lastName = user?.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    const email = user?.email?.trim();
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const selectedAvatar = getProfileAvatar(user?.profileImage);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-red-600 to-red-800 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {selectedAvatar ? (
                    <Image
                      src={selectedAvatar.src}
                      alt={selectedAvatar.label}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user)
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-6 px-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName && user?.lastName ? (
                  <span>
                    {user.firstName} {user.lastName}
                    {user.username && (
                      <span className="text-gray-400 font-normal"> (@{user.username})</span>
                    )}
                  </span>
                ) : user?.username ? (
                  <span>@{user.username}</span>
                ) : (
                  user?.email
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Membre depuis le{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isEditing
                      ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      : "border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Annuler
                    </>
                  ) : (
                    <>
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Modifier
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 space-y-6">
                {saveSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <div className="flex">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="ml-3 text-sm text-green-700 font-medium">
                        Profil mis à jour avec succès !
                      </p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-500 mb-1"
                    >
                      Nom d&apos;utilisateur
                    </label>
                    {isEditing ? (
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="Nom d'utilisateur"
                      />
                    ) : (
                      <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {user?.username || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="block text-sm font-medium text-gray-500 mb-1">Email</p>
                    <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {user?.email || "-"}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-500 mb-1"
                    >
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="Prénom"
                      />
                    ) : (
                      <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {user?.firstName || "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-500 mb-1"
                    >
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="Nom"
                      />
                    ) : (
                      <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {user?.lastName || "-"}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <ProfileAvatarPicker
                    value={formData.profileImage}
                    onChange={(avatar: ProfileAvatarImage) => {
                      setError("");
                      setFormData((prev) => ({ ...prev, profileImage: avatar }));
                    }}
                    disabled={isSaving}
                  />
                ) : (
                  <div>
                    <p className="block text-sm font-medium text-gray-500 mb-1">Image de profil</p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 inline-flex">
                      {selectedAvatar ? (
                        <Image
                          src={selectedAvatar.src}
                          alt={selectedAvatar.label}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">Aucune image selectionnee</span>
                      )}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white transition-colors ${
                        isSaving
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <svg
                            aria-hidden="true"
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Enregistrer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      disabled={isSaving}
                      className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg transition-colors ${
                        isSaving
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      }`}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center p-4 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-2xl mr-4">🎄</span>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Événements</p>
                      <p className="text-xl font-bold text-gray-900">
                        {user?.stats?.eventsCreated ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-2xl mr-4">🎁</span>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Participations</p>
                      <p className="text-xl font-bold text-gray-900">
                        {user?.stats?.participations ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-2xl mr-4">❄️</span>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Cadeaux offerts</p>
                      <p className="text-xl font-bold text-gray-900">
                        {user?.stats?.giftsOffered ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/events"
                  className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-lg">📅</span>
                    Mes Événements
                  </span>
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href="/invitations"
                  className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-lg">📬</span>
                    Invitations
                  </span>
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href="/secretsanta/create"
                  className="w-full flex items-center justify-between p-3 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-lg">🎅</span>
                    Créer un Secret Santa
                  </span>
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-red-400 group-hover:text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
