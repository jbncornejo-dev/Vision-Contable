"use client";

import { motion } from "framer-motion";
import { ChevronRight, Activity, Cpu } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative pt-32 md:pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(84,131,179,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(84,131,179,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_top_left,black_40%,transparent_70%)]" />
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#C1E8FF]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-20 w-[400px] h-[400px] bg-[#5483B3]/10 rounded-full blur-[100px]" />
            </div>

            {/* Left Side: Text content */}
            <div className="flex-1 space-y-8 z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 border border-[#5483B3]/30 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full font-share-tech text-xs text-[#052659] uppercase tracking-widest shadow-[0_4px_15px_rgba(84,131,179,0.1)]"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5483B3] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#052659]"></span>
                    </span>
                    <span className="font-bold">V.2.0 Keras Arch Active</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-unbounded font-black text-5xl md:text-6xl lg:text-[75px] leading-[1.05] tracking-tighter uppercase text-[#021024] relative"
                >
                    La IA que <br />
                    <span className="relative inline-block mt-2 mb-2">
                        <span className="absolute -inset-1 bg-[#5483B3]/10 blur-xl rounded-full"></span>
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#052659] via-[#5483B3] to-[#021024] bg-[length:200%_auto] hover:bg-right transition-all duration-1000">
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
                    className="font-space-grotesk text-lg md:text-xl text-[#021024]/70 max-w-xl font-medium tracking-tight leading-relaxed border-l-2 border-[#5483B3]/40 pl-4"
                >
                    Procesamiento de facturas, contratos y NITs en milisegundos mediante Redes Neuronales Convolucionales. Normalización visual automática sin error humano.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-5 pt-6"
                >
                    <button className="group relative bg-[#021024] text-white font-share-tech text-base px-8 py-4 rounded-sm transition-all flex items-center justify-center gap-3 overflow-hidden shadow-[4px_4px_0px_0px_rgba(84,131,179,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(84,131,179,0.5)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 active:shadow-none">
                        <div className="absolute inset-0 w-0 bg-[#052659] transition-all duration-500 ease-out group-hover:w-full z-0" />
                        <span className="relative z-10 flex items-center gap-2 font-bold tracking-widest">
                            <span className="text-[#5483B3] group-hover:text-white transition-colors">~</span>
                            INICIAR DEMO
                            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                    </button>

                    <button className="group relative border border-[#021024]/20 bg-white/40 backdrop-blur-md px-8 py-4 rounded-sm font-share-tech text-[#021024] hover:bg-white hover:border-[#021024]/40 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <span className="relative z-10 flex items-center gap-2 font-bold tracking-widest">
                            <Cpu size={18} className="text-[#5483B3] group-hover:text-[#052659] transition-colors" />
                            VER ARQUITECTURA
                        </span>
                    </button>
                </motion.div>
            </div>

            {/* Right Side: Visual / Scanner Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex-1 w-full relative mt-12 lg:mt-0"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10 hidden lg:block pointer-events-none" />

                <div className="relative w-full max-w-lg mx-auto aspect-square border border-[#5483B3]/20 bg-white/40 backdrop-blur-xl flex items-center justify-center rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(5,38,89,0.15)] group">
                    {/* Inner Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(84,131,179,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(84,131,179,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)] opacity-50" />

                    {/* Corner Tech Accents */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#052659]/30 rounded-tl-lg transition-all duration-500 group-hover:border-[#052659]/60 group-hover:-translate-x-1 group-hover:-translate-y-1" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#052659]/30 rounded-tr-lg transition-all duration-500 group-hover:border-[#052659]/60 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#052659]/30 rounded-bl-lg transition-all duration-500 group-hover:border-[#052659]/60 group-hover:-translate-x-1 group-hover:translate-y-1" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#052659]/30 rounded-br-lg transition-all duration-500 group-hover:border-[#052659]/60 group-hover:translate-x-1 group-hover:translate-y-1" />

                    {/* Floating Data Nodes */}
                    <motion.div
                        animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 right-12 w-16 h-8 bg-white border border-[#5483B3]/20 rounded-md shadow-sm flex items-center justify-center gap-1 z-0"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5483B3] animate-pulse" />
                        <span className="font-share-tech text-[10px] text-[#052659]">DAT.01</span>
                    </motion.div>

                    <motion.div
                        animate={{ y: [10, -10, 10], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/4 left-12 w-16 h-8 bg-white border border-[#5483B3]/20 rounded-md shadow-sm flex items-center justify-center gap-1 z-0"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#021024] animate-pulse" />
                        <span className="font-share-tech text-[10px] text-[#052659]">IMG.99</span>
                    </motion.div>

                    {/* Central Document Representation */}
                    <motion.div
                        animate={{
                            rotate: [0, 2, 0, -2, 0],
                            y: [0, -5, 0, 5, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-56 h-72 border border-[#021024]/15 bg-white relative p-5 flex flex-col gap-4 rounded-xl shadow-2xl z-10"
                    >
                        {/* Doc Header */}
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <div className="space-y-2 w-full">
                                <div className="w-1/2 h-3 bg-gradient-to-r from-[#C1E8FF] to-[#5483B3]/30 rounded-full" />
                                <div className="w-1/3 h-2 bg-gray-100 rounded-full" />
                            </div>
                            <div className="w-8 h-8 bg-[#052659]/5 rounded-md flex-shrink-0" />
                        </div>

                        {/* Doc Content Structure */}
                        <div className="space-y-3 flex-1">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-1/2 bg-[#5483B3]/20"
                                />
                            </div>
                            <div className="w-5/6 h-2 bg-gray-100 rounded-full" />
                            <div className="w-4/6 h-2 bg-gray-100 rounded-full" />
                            <div className="w-full h-2 bg-gray-100 rounded-full" />
                        </div>

                        {/* Extracted Data Highlight */}
                        <div className="mt-auto p-3 bg-[#C1E8FF]/20 rounded-lg border border-[#5483B3]/20 relative overflow-hidden group/box">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-1/3 h-2 bg-[#5483B3] rounded-full mb-2"
                            />
                            <div className="w-2/3 h-2 bg-[#052659]/20 rounded-full" />

                            {/* Scanning effect inside box */}
                            <motion.div
                                animate={{ left: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                            />
                        </div>
                    </motion.div>

                    {/* Upgraded Scanner Laser */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 w-full z-20 flex flex-col items-center pointer-events-none"
                    >
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#5483B3] to-transparent shadow-[0_0_20px_rgba(84,131,179,1)]" />
                        <div className="w-full h-24 bg-gradient-to-b from-[#5483B3]/10 to-transparent" />
                    </motion.div>

                    {/* HUD Overlays */}
                    <div className="absolute top-6 right-6 font-share-tech text-[10px] text-[#5483B3] flex flex-col items-end gap-1 opacity-80 z-20">
                        <span className="bg-white/50 px-2 py-0.5 rounded-sm">SYS.OPT // OK</span>
                        <span className="bg-white/50 px-2 py-0.5 rounded-sm">LAT // 12ms</span>
                    </div>

                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-[#5483B3]/20 z-20">
                        <Activity size={12} className="text-[#052659]" />
                        <span className="font-share-tech text-xs tracking-widest text-[#052659] font-bold">
                            ANALYZING...
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}