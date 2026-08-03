"use client";

import { useRouter } from "next/navigation";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/session";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">Profile</h1>
      <div className="mt-8 max-w-md space-y-3 rounded-xl border border-ink/10 bg-white/70 p-6">
        <p>
          <span className="text-ink/50">Name</span>
          <br />
          {user?.name}
        </p>
        <p>
          <span className="text-ink/50">Email</span>
          <br />
          {user?.email}
        </p>
        <p>
          <span className="text-ink/50">Role</span>
          <br />
          {user?.role}
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          Log out
        </Button>
      </div>
    </PageEnter>
  );
}
