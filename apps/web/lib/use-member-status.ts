import { useState, useEffect } from "react";
import { useSession } from "./auth-client";
import { apiFetch } from "./api";
interface MeResponse {
  id?: string;
  name?: string;
  email?: string;
  subscriptionStatus?: "ACTIVE" | "PENDING" | "SUSPENDED" | "CANCELLED" | null;
  [key: string]: any;
}

let cachedProfilePromise: Promise<MeResponse> | null = null;

export function useMemberStatus() {
  const { data: session, isPending: isSessionPending } = useSession();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [isProfilePending, setIsProfilePending] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (!profile) {
        setIsProfilePending(true);
        if (!cachedProfilePromise) {
          cachedProfilePromise = apiFetch<MeResponse>('/api/members/me');
        }
        cachedProfilePromise
          .then(res => setProfile(res))
          .catch(err => {
            console.error(err);
            cachedProfilePromise = null;
          })
          .finally(() => setIsProfilePending(false));
      }
    } else {
      setProfile(null);
    }
  }, [session?.user, profile]);

  const isLoading = isSessionPending || (!!session?.user && isProfilePending && !profile);
  const isMember = !!session?.user;
  const isSuspended = profile?.subscriptionStatus === "SUSPENDED";
  const isActive = profile?.subscriptionStatus === "ACTIVE";

  return { isMember, isSuspended, isActive, isLoading, profile };
}
