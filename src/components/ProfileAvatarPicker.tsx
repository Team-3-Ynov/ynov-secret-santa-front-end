import Image from "next/image";
import { PROFILE_AVATARS, type ProfileAvatarImage } from "@/constants/profileAvatars";

interface ProfileAvatarPickerProps {
  value: ProfileAvatarImage | "";
  onChange: (avatar: ProfileAvatarImage) => void;
  disabled?: boolean;
  error?: string | null;
}

export default function ProfileAvatarPicker({
  value,
  onChange,
  disabled = false,
  error = null,
}: ProfileAvatarPickerProps) {
  return (
    <fieldset className="space-y-3" aria-describedby={error ? "profile-avatar-error" : undefined}>
      <legend className="text-sm font-medium text-gray-700">Image de profil</legend>
      <p className="text-xs text-gray-500">Choisissez une image parmi les avatars proposés.</p>

      <div className="grid grid-cols-5 gap-2">
        {PROFILE_AVATARS.map((avatar) => {
          const isSelected = value === avatar.src;

          return (
            <label
              key={avatar.id}
              className={`rounded-lg p-1 border-2 cursor-pointer transition-colors ${
                disabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-100"
                  : isSelected
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
              }`}
            >
              <input
                type="radio"
                name="profileAvatar"
                className="sr-only"
                checked={isSelected}
                onChange={() => onChange(avatar.src)}
                aria-label={avatar.label}
                disabled={disabled}
              />
              <Image
                src={avatar.src}
                alt={avatar.label}
                width={56}
                height={56}
                className="rounded-full"
              />
            </label>
          );
        })}
      </div>

      {error && (
        <p id="profile-avatar-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
