import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CinematicPipeline from "@/components/CinematicPipeline";
import BentoArchitecture from "@/components/BentoArchitecture";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <Header />
      <Hero />
      <CinematicPipeline />
      <BentoArchitecture />
      <Footer />
    </main>
  );
}