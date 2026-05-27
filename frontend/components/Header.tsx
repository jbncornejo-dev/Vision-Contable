import { ScanLine, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/logo.svg";

export default function Header() {
    return (
        <nav className="fixed top-0 w-full border-b border-[#5483B3]/20 bg-white/70 backdrop-blur-md z-50 transition-all duration-500 hover:bg-white/80 hover:shadow-[0_10px_40px_-10px_rgba(5,38,89,0.1)]">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-3 font-share-tech text-xl text-[#021024] tracking-tight group cursor-pointer">
                    <div className="relative flex items-center justify-center">
                        <Image 
                            src={logo} 
                            alt="Visión Contable Logo" 
                            width={32} 
                            height={32} 
                            className="transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                        />
                        <div className="absolute inset-0 bg-[#5483B3] blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-full" />
                    </div>
                    <span className="font-bold relative flex items-center">
                        Visión<span className="text-[#052659] transition-colors duration-300 group-hover:text-[#5483B3]">_Contable</span>
                        <span className="inline-block w-2 h-4 bg-[#052659] ml-1 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" />
                    </span>
                </div>

                {/* Navigation Links & Buttons */}
                <div className="flex items-center gap-6 font-dm-sans text-sm tracking-wide">
                    <button className="hidden md:flex items-center gap-1 text-[#5483B3] hover:text-[#052659] transition-all duration-300 group relative py-2">
                        <span className="relative z-10">// DOCS</span>
                        <ChevronRight size={14} className="opacity-0 -ml-3 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0 text-[#052659]" />
                        <span className="absolute bottom-1 left-0 w-0 h-[1px] bg-[#052659] transition-all duration-300 group-hover:w-full" />
                    </button>

                    <Link href="/dashboard" className="group px-5 py-2 md:px-6 md:py-2.5 bg-transparent border border-[#021024] text-[#021024] hover:bg-[#021024] hover:text-white transition-all duration-300 rounded-sm flex items-center gap-3 relative shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(84,131,179,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                        <span className="hidden md:inline font-medium tracking-wide">IR AL DASHBOARD</span>
                        <ScanLine size={16} className="transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}