import { redirect } from "next/navigation";

export default function StudentRedirect() {
  // Redirect singular /student requests to your admin dashboard
  redirect("/dashboard/admin");
}