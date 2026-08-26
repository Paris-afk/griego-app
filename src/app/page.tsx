import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile) redirect("/onboarding");
  redirect("/today");
}
