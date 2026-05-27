"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "@studio-freight/lenis";
import { FileText, File, FileCode2, ScanLine, Search, ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CinematicPipeline() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
        });

        function raf(time: number) {
            lenis.raf(time);
            ScrollTrigger.update();
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    useGSAP(() => {
        gsap.set(".document-node", { xPercent: -50, top: "-10vh" });
        gsap.set(".folder-glow", { xPercent: -50 });
        gsap.set(".doc-rotated", { rotate: 90 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".pin-trigger",
                start: "top top",
                end: "+=250%",
                scrub: 1,
                pin: true,
                anticipatePin: 1,
            },
        });

        tl.to(".document-node", {
            top: "28vh",
            scale: 1,
            opacity: 1,
            stagger: 0.1,
            duration: 2,
            ease: "power2.out",
        })

            .to(".camera-wrapper", { scale: 1.05, duration: 1 }, "<")
            .to(".scanner-1", { scaleX: 1, opacity: 1, duration: 0.5 })
            .to(".scanner-1", { top: "40vh", duration: 1.5, ease: "none" })

            .to(".doc-bad", {
                filter: "blur(10px) sepia(1) hue-rotate(-50deg) saturate(5)",
                opacity: 0,
                y: "+=50",
                scale: 0.8,
                rotate: -10,
                duration: 1
            }, "<0.5")

            .to(".scanner-1", { opacity: 0, duration: 0.5 })
            .to(".doc-good", { top: "55vh", duration: 2, ease: "power2.inOut" })
            .to(".scanner-2", { scaleX: 1, opacity: 1, duration: 0.5 }, "-=0.5")
            .to(".scanner-2", { top: "68vh", duration: 1.5, ease: "none" })

            .to(".doc-rotated", { rotate: 0, borderColor: "#5483B3", duration: 1 }, "<0.5")

            .to(".scanner-2", { opacity: 0, duration: 0.5 })
            .to(".camera-wrapper", { scale: 0.95, duration: 1 }, "<")
            .to(".folders-ui", { top: "75vh", opacity: 1, duration: 1 }, "<")

            .to(".doc-nit", { left: "20%", top: "82vh", scale: 0.6, duration: 2, ease: "power2.inOut" }, "classify")
            .to(".doc-contract", { left: "50%", top: "82vh", scale: 0.6, duration: 2, ease: "power2.inOut" }, "classify")
            .to(".doc-invoice", { left: "80%", top: "82vh", scale: 0.6, duration: 2, ease: "power2.inOut" }, "classify")

            .to(".doc-good", { opacity: 0, duration: 0.5 })
            .to(".folder-glow", { boxShadow: "0px 0px 40px 10px rgba(84, 131, 179, 0.4)", borderColor: "#7DA0CA", duration: 0.5, yoyo: true, repeat: 1 });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative bg-[#021024] text-white">
            <div className="pin-trigger h-screen w-full">
                <div className="camera-wrapper h-screen w-full overflow-hidden flex flex-col items-center cyber-grid-dark bg-[#021024]">

                    <div className="absolute top-0 w-[800px] h-[400px] bg-[#5483B3]/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="absolute top-28 text-center z-50">
                        <h2 className="font-unbounded font-bold text-3xl md:text-5xl text-white uppercase tracking-tighter">
                            Flujo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5483B3] to-[#C1E8FF]">inteligente</span>
                        </h2>
                        <p className="font-dm-sans text-[#7DA0CA] mt-2 tracking-wide text-sm flex items-center justify-center gap-2">
                            <ScanLine size={14} /> Desliza para ver el recorrido
                        </p>
                    </div>

                    <div className="scanner-1 absolute top-[28vh] w-full max-w-5xl h-[2px] bg-gradient-to-r from-transparent via-[#ef4444] to-transparent shadow-[0_0_20px_#ef4444] opacity-0 scale-x-0 z-30 flex justify-center">
                        <span className="absolute -top-6 font-dm-sans text-xs text-white bg-[#ef4444]/20 border border-[#ef4444]/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                            <Search size={10} /> Revisión de calidad
                        </span>
                    </div>

                    <div className="scanner-2 absolute top-[55vh] w-full max-w-5xl h-[2px] bg-gradient-to-r from-transparent via-[#5483B3] to-transparent shadow-[0_0_20px_#5483B3] opacity-0 scale-x-0 z-30 flex justify-center">
                        <span className="absolute -top-6 font-dm-sans text-xs text-[#052659] bg-[#C1E8FF]/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                            <ShieldCheck size={10} /> Enderezar documento
                        </span>
                    </div>

                    <div className="relative w-full max-w-5xl h-full mx-auto">
                        <div className="document-node doc-good doc-nit absolute opacity-0 scale-50" style={{ left: "15%" }}>
                            <div className="border border-[#5483B3]/40 bg-white/10 backdrop-blur-md p-4 w-20 h-28 md:w-28 md:h-36 flex flex-col items-center justify-center rounded-xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                                <FileCode2 size={32} className="text-[#C1E8FF] mb-2" />
                                <span className="font-dm-sans text-xs text-white tracking-wide">NIT</span>
                            </div>
                        </div>

                        <div className="document-node doc-bad absolute opacity-0 scale-50" style={{ left: "32.5%" }}>
                            <div className="border border-[#ef4444]/40 bg-white/5 backdrop-blur-sm p-4 w-20 h-28 md:w-28 md:h-36 flex flex-col items-center justify-center rounded-xl shadow-lg blur-[2px]">
                                <FileText size={32} className="text-[#C1E8FF]/50 mb-2" />
                                <span className="font-dm-sans text-xs text-white/50 tracking-wide">FACT</span>
                            </div>
                        </div>

                        <div className="document-node doc-good doc-contract doc-rotated absolute opacity-0 scale-50" style={{ left: "50%" }}>
                            <div className="border border-[#ef4444]/60 bg-white/10 backdrop-blur-md p-4 w-20 h-28 md:w-28 md:h-36 flex flex-col items-center justify-center rounded-xl shadow-2xl">
                                <File size={32} className="text-[#ef4444] mb-2" />
                                <span className="font-dm-sans text-xs text-white tracking-wide">CNTR</span>
                            </div>
                        </div>

                        <div className="document-node doc-bad absolute opacity-0 scale-50" style={{ left: "67.5%" }}>
                            <div className="border border-[#ef4444]/40 bg-white/5 backdrop-blur-sm p-4 w-20 h-28 md:w-28 md:h-36 flex flex-col items-center justify-center rounded-xl shadow-lg blur-[2px]">
                                <FileCode2 size={32} className="text-[#C1E8FF]/50 mb-2" />
                                <span className="font-dm-sans text-xs text-white/50 tracking-wide">NIT</span>
                            </div>
                        </div>

                        <div className="document-node doc-good doc-invoice absolute opacity-0 scale-50" style={{ left: "85%" }}>
                            <div className="border border-[#5483B3]/40 bg-white/10 backdrop-blur-md p-4 w-20 h-28 md:w-28 md:h-36 flex flex-col items-center justify-center rounded-xl shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                                <FileText size={32} className="text-[#C1E8FF] mb-2" />
                                <span className="font-dm-sans text-xs text-white tracking-wide">FACT</span>
                            </div>
                        </div>
                    </div>

                    <div className="folders-ui absolute top-[85vh] w-full max-w-5xl mx-auto opacity-0 z-10 h-32">
                        <div className="folder-glow absolute bottom-0 flex flex-col items-center justify-end w-28 h-20 md:w-36 md:h-24 border border-[#5483B3]/30 bg-[#021024]/80 backdrop-blur-xl rounded-t-2xl shadow-xl pb-3" style={{ left: "20%" }}>
                            <div className="absolute -top-3 font-dm-sans text-xs bg-[#5483B3] text-white px-3 py-1 rounded-sm shadow-md tracking-wide font-bold">/NITS</div>
                            <FileCode2 size={24} className="text-[#7DA0CA] opacity-50" />
                        </div>

                        <div className="folder-glow absolute bottom-0 flex flex-col items-center justify-end w-28 h-20 md:w-36 md:h-24 border border-[#5483B3]/30 bg-[#021024]/80 backdrop-blur-xl rounded-t-2xl shadow-xl pb-3" style={{ left: "50%" }}>
                            <div className="absolute -top-3 font-dm-sans text-xs bg-[#5483B3] text-white px-3 py-1 rounded-sm shadow-md tracking-wide font-bold">/CNTR</div>
                            <File size={24} className="text-[#7DA0CA] opacity-50" />
                        </div>

                        <div className="folder-glow absolute bottom-0 flex flex-col items-center justify-end w-28 h-20 md:w-36 md:h-24 border border-[#5483B3]/30 bg-[#021024]/80 backdrop-blur-xl rounded-t-2xl shadow-xl pb-3" style={{ left: "80%" }}>
                            <div className="absolute -top-3 font-dm-sans text-xs bg-[#5483B3] text-white px-3 py-1 rounded-sm shadow-md tracking-wide font-bold">/FACT</div>
                            <FileText size={24} className="text-[#7DA0CA] opacity-50" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}