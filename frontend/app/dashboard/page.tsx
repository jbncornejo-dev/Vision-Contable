"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, CheckCircle2, Loader2, Server, Terminal, Settings, History, PlusSquare } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);

    // Referencia para abrir el selector de archivos oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Función que se ejecuta cuando el usuario selecciona un archivo real
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Mandamos el archivo real a nuestro puente (API Route)
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });

            const blob = await response.json();

            // 2. Vercel nos responde con la URL real, la guardamos en la interfaz
            const newDoc = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                status: "Procesando en FastAPI...",
                blobUrl: blob.url // ¡Esta es la URL real de Vercel Blob!
            };

            setDocuments((prev) => [newDoc, ...prev]);
            setIsUploading(false);

            // 3. (Aún simulamos FastAPI porque el backend de Python no está conectado)
            // En el futuro, aquí haremos un fetch() mandando 'blob.url' a Python.
            setTimeout(() => {
                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === newDoc.id
                            ? { ...doc, status: "Clasificado exitosamente", isDone: true }
                            : doc
                    )
                );
            }, 3500);

        } catch (error) {
            console.error("Error al subir el archivo:", error);
            setIsUploading(false);
            alert("Hubo un error al subir el archivo a Vercel.");
        }
    };

    return (
        <div className="min-h-screen bg-[#021024] text-white flex font-space-grotesk overflow-hidden selection:bg-[#7DA0CA] selection:text-[#021024]">

            {/* ================= SIDEBAR ================= */}
            <aside className="w-64 border-r border-[#5483B3]/20 bg-[#021024]/80 backdrop-blur-xl flex flex-col hidden md:flex">
                <div className="h-20 flex items-center px-6 border-b border-[#5483B3]/20">
                    <div className="flex items-center gap-2 font-share-tech text-[#C1E8FF] tracking-tight">
                        <Terminal size={18} className="text-[#5483B3]" />
                        <span>&gt;_ Visión_Contable</span>
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2 font-share-tech text-sm tracking-widest">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#C1E8FF]/10 text-[#C1E8FF] rounded-sm border border-[#5483B3]/30">
                        <PlusSquare size={16} /> CLASIFICAR LOTE
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[#5483B3] hover:text-[#C1E8FF] hover:bg-[#C1E8FF]/5 rounded-sm transition-colors">
                        <History size={16} /> HISTORIAL
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[#5483B3] hover:text-[#C1E8FF] hover:bg-[#C1E8FF]/5 rounded-sm transition-colors">
                        <Settings size={16} /> CONFIGURACIÓN
                    </button>
                </nav>

                <div className="p-4 border-t border-[#5483B3]/20">
                    <div className="bg-[#052659]/30 border border-[#5483B3]/30 p-3 rounded-sm">
                        <div className="flex items-center gap-2 text-xs font-share-tech text-green-400 mb-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> FastAPI Online
                        </div>
                        <div className="text-[10px] text-[#5483B3] font-share-tech">Motor: TensorFlow CPU</div>
                    </div>
                </div>
            </aside>

            {/* ================= ÁREA PRINCIPAL ================= */}
            <main className="flex-1 flex flex-col relative h-screen overflow-y-auto">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(125, 160, 202, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(125, 160, 202, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}>
                </div>

                <header className="h-20 border-b border-[#5483B3]/20 flex items-center justify-between px-8 z-10 bg-[#021024]/80 backdrop-blur-md">
                    <h1 className="font-unbounded font-bold text-xl text-[#C1E8FF] uppercase tracking-wide">
                        Entorno de Clasificación
                    </h1>
                    <Link href="/">
                        <button className="font-share-tech text-xs border border-[#5483B3]/40 px-4 py-2 text-[#5483B3] hover:text-white transition-colors">
                            [ SALIR AL INICIO ]
                        </button>
                    </Link>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full z-10 flex-1 flex flex-col">

                    {/* ================= DROPZONE CON INPUT REAL ================= */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-share-tech text-[#7DA0CA] tracking-widest text-sm uppercase">1. Input de Archivos</h2>
                            <span className="font-share-tech text-xs text-[#5483B3]">Powered by Vercel Blob</span>
                        </div>

                        {/* Input oculto que recibe el archivo */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()} // Al hacer clic, abrimos el input oculto
                            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading
                                    ? "border-[#7DA0CA] bg-[#7DA0CA]/10"
                                    : "border-[#5483B3] bg-[#C1E8FF]/5 hover:bg-[#C1E8FF]/10 hover:border-[#7DA0CA]"
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={48} className="text-[#7DA0CA] animate-spin mb-4" />
                                    <span className="font-share-tech text-white text-lg">Subiendo a Vercel Blob...</span>
                                    <span className="font-share-tech text-[#5483B3] text-xs mt-2">Enviando datos encriptados</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={48} className="text-[#5483B3] mb-4" />
                                    <span className="font-share-tech text-white text-lg">Haz clic para buscar un documento</span>
                                    <span className="font-share-tech text-[#5483B3] text-xs mt-2">Soporta JPG, PNG, PDF (Max 5MB)</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ================= HISTORIAL DE PROCESAMIENTO ================= */}
                    <div className="flex-1">
                        <h2 className="font-share-tech text-[#7DA0CA] tracking-widest text-sm uppercase mb-4">2. Pipeline en Tiempo Real</h2>

                        {documents.length === 0 ? (
                            <div className="w-full border border-[#5483B3]/20 bg-[#021024] p-8 text-center text-[#5483B3] font-share-tech text-sm flex flex-col items-center justify-center h-40 rounded-xl">
                                <Server size={24} className="mb-2 opacity-50" />
                                [ Esperando tensores... ]
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between border border-[#5483B3]/30 bg-[#C1E8FF]/5 p-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${doc.isDone ? 'bg-[#052659]' : 'bg-[#5483B3]/20 animate-pulse'}`}>
                                                <File size={20} className={doc.isDone ? 'text-[#C1E8FF]' : 'text-[#5483B3]'} />
                                            </div>
                                            <div>
                                                <div className="font-share-tech text-white text-sm">{doc.name}</div>
                                                {/* URL Real Clickable */}
                                                <a href={doc.blobUrl} target="_blank" rel="noreferrer" className="font-share-tech text-[10px] text-[#5483B3] hover:text-[#7DA0CA] underline">
                                                    {doc.blobUrl}
                                                </a>
                                            </div>
                                        </div>

                                        <div className={`font-share-tech text-xs flex items-center gap-2 ${doc.isDone ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {!doc.isDone ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                            {doc.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}