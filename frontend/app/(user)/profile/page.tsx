"use client";

import { useRouter } from "next/navigation";

import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/session";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <PageEnter>
      <PageHeader title="Profile" description="Account details for this session." />
      <Surface className="mt-8 max-w-md p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-ink-muted">Name</dt>
            <dd className="mt-1 break-words [overflow-wrap:anywhere] font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Email</dt>
            <dd className="mt-1 break-all font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">Role</dt>
            <dd className="mt-1 font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
        <Button
          className="mt-6"
          variant="outline"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          Log out
        </Button>
      </Surface>
    </PageEnter>
  );
}
