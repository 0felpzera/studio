import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function LandingPage() {
    return (
      <div className="relative">
        <HeroGeometric badge="ViralBoost AI"
                title1 = "Eleve Sua"
                title2 = "Visão Digital"
                subtitle="Crie experiências digitais excepcionais através de um design inovador e tecnologia de ponta." />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <Link href="/login">
            <Button size="lg" className="font-bold">Comece Agora</Button>
          </Link>
        </div>
      </div>
    )
}
