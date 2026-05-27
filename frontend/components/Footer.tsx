import Link from "next/link";
import { Terminal, ChevronRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-[#5483B3]/20 bg-[#021024] text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                <h2 className="font-unbounded font-black text-3xl md:text-5xl uppercase mb-6">
                    ¿Listo para automatizar?
                </h2>
                <p className="font-dm-sans text-[#C1E8FF]/70 mb-10 max-w-xl">
                    Entra al entorno de pruebas, sube documentos reales y revisa los resultados en segundos.
                </p>

                {/* ESTE BOTÓN NOS LLEVA AL DASHBOARD */}
                <Link href="/dashboard">
                    <button className="bg-[#7DA0CA] text-[#021024] font-dm-sans text-lg px-10 py-5 rounded-sm hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(125,160,202,0.3)] hover:-translate-y-1">
                        IR AL DASHBOARD <ChevronRight size={20} />
                    </button>
                </Link>

                <div className="mt-24 w-full flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-6 font-dm-sans text-xs text-white/40">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Terminal size={14} /> Visión_Contable 2026
                    </div>
                    <div className="flex gap-6">
                        <span>Entorno de prueba</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}