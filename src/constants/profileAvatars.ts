export const PROFILE_AVATARS = [
  { id: "avatar-1", label: "Avatar 1", src: "/avatars/avatar-1.svg" },
  { id: "avatar-2", label: "Avatar 2", src: "/avatars/avatar-2.svg" },
  { id: "avatar-3", label: "Avatar 3", src: "/avatars/avatar-3.svg" },
  { id: "avatar-4", label: "Avatar 4", src: "/avatars/avatar-4.svg" },
  { id: "avatar-5", label: "Avatar 5", src: "/avatars/avatar-5.svg" },
] as const;

export const DEFAULT_PROFILE_AVATAR_IMAGE = PROFILE_AVATARS[0].src;

export type ProfileAvatar = (typeof PROFILE_AVATARS)[number];
export type ProfileAvatarImage = ProfileAvatar["src"];

export function isValidProfileAvatarImage(value: string): value is ProfileAvatarImage {
  return PROFILE_AVATARS.some((avatar) => avatar.src === value);
}

export function getProfileAvatar(value: string | null | undefined): ProfileAvatar | null {
  if (!value) {
    return null;
  }

  return PROFILE_AVATARS.find((avatar) => avatar.src === value || avatar.id === value) ?? null;
}
