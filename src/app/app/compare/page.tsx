import { redirect } from "next/navigation";

/** Food compare is out of R1 until Premium billing exists. */
export default function ComparePage() {
  redirect("/app");
}
