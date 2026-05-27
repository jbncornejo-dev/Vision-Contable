"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative pt-32 md:pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#C1E8FF]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-[#5483B3]/10 rounded-full blur-[100px]" />
            </div>

            {/* Text content - centered */}
            <div className="space-y-8 z-10 w-full max-w-3xl text-center">

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-unbounded font-black text-5xl md:text-6xl lg:text-[75px] leading-[1.05] tracking-tighter text-[#021024] relative"
                >
                    La IA que <br />
                    <span className="relative inline-block mt-2 mb-2">
                        <span className="relative text-[#052659]">
                            entiende
                        </span>
                    </span> <br />
                    tus finanzas
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-dm-sans text-lg md:text-xl text-gray-500 max-w-xl mx-auto font-medium leading-relaxed"
                >
                    Ordena facturas, NITs y declaraciones juradas con un flujo simple y resultados claros. Menos tiempo manual, más control.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
                >
                    <Link href="/dashboard" className="bg-[#021024] text-white font-dm-sans text-base px-8 py-4 transition-all flex items-center justify-center hover:bg-[#052659] active:translate-y-0">
                        <span className="font-semibold">
                            Ir al dashboard
                        </span>
                    </Link>

                    <Link href="#flujo" className="border border-gray-300 bg-white px-8 py-4 font-dm-sans text-[#021024] hover:border-gray-400 transition-all flex items-center justify-center">
                        <span className="font-semibold">
                            Ver flujo
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}