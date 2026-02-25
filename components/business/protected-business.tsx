"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = { children: ReactNode; allowedRoles?: string[] };

export default function ProtectedBusiness({ children, allowedRoles }: Props) {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/unauthorized");
      return;
    }
    try {
      const u = JSON.parse(userStr);
      const role = u.role;
      const allowed = allowedRoles || [
        "business_head",
        "project_manager",
        "lead_architect",
      ];
      if (!role || !allowed.includes(role)) {
        router.push("/unauthorized");
      }
    } catch (e) {
      router.push("/unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
