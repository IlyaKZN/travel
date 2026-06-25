import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProfileView } from "./profile";
import { api, getToken } from "@/lib/api";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({ meta: [{ title: "Профиль — Waymate" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useParams();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  return <ProfileView userId={userId} owner={userId === meQuery.data?.id} />;
}
