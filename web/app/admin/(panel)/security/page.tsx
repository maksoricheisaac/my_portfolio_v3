import { redirect } from "next/navigation";

// Security now lives in Settings → Sécurité.
export default function SecurityRedirect() {
  redirect("/admin/settings?tab=security");
}
