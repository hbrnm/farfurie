import { redirect } from "next/navigation";

/** Teams is out of R1 — no community backend. */
export default function TeamsPage() {
  redirect("/app");
}
