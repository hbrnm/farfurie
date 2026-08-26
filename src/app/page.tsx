import { ClientOnly } from "@/components/ClientOnly";
import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  return (
    <ClientOnly>
      <LandingPage />
    </ClientOnly>
  );
}
