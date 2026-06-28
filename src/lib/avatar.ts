import type { User } from "@/lib/api";

type AvatarUser = Pick<User, "avatar" | "avatarColor"> | null | undefined;

export function avatarClass(user: AvatarUser) {
  return { "avatar--image": Boolean(user?.avatar) };
}

export function avatarStyle(user: AvatarUser, fallback = "#94a3b8") {
  return {
    backgroundColor: user?.avatarColor ?? fallback,
    backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
  };
}
