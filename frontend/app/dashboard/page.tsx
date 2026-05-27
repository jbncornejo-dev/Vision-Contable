"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, File, CheckCircle2, Loader2, Folder, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

type DocItem = {
    id: string;
    name: string;
    tempPath?: string;
    status: "en_cola" | "procesando" | "procesado" | "error";
    result?: any;
    error?: string;
};

export default function Dashboard() {
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [documents, setDocuments] = useState<DocItem[]>([]);
    const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
        Facturas: true,
        Declaraciones_Juradas: false,
        NITs: false,
        No_Reconocidos: false,
    });
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const fetchFolderCounts = async () => {
        try {
            const response = await fetch(`${backendUrl}/documentos`);
            if (!response.ok) return;
            const data = await response.json();
            const counts: Record<string, number> = {};
            Object.keys(data || {}).forEach((key) => {
                counts[key] = data[key]?.cantidad || 0;
            });
            setFolderCounts(counts);
        } catch {
            setFolderCounts({});
        }
    };

    useEffect(() => {
        fetchFolderCounts();
    }, []);


    // Referencia para abrir el selector de archivos oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Función que se ejecuta cuando el usuario selecciona un archivo real
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            const form = new FormData();
            files.forEach((file) => form.append("files", file));

            const response = await fetch(`${backendUrl}/uploads`, {
                method: "POST",
                body: form,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status} al subir archivos`);
            }

            const payload = await response.json();
            const nuevos: DocItem[] = (payload.archivos || []).map((item: any) => ({
                id: Math.random().toString(36).slice(2, 10),
                name: item.nombre_original,
                tempPath: item.archivo_temporal,
                status: "en_cola",
            }));

            setDocuments((prev) => [...nuevos, ...prev]);
        } catch (error) {
            console.error("Error al subir archivos:", error);
            setDocuments((prev) => prev.map((doc) => ({ ...doc, status: "error", error: "Error al subir" })));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleProcesarLote = async () => {
        setIsProcessing(true);
        setDocuments((prev) => prev.map((doc) => (doc.status === "en_cola" ? { ...doc, status: "procesando" } : doc)));

        try {
            const response = await fetch(`${backendUrl}/uploads/procesar`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status} al procesar`);
            }

            const payload = await response.json();
            const resultados = payload.resultados || [];

            setDocuments((prev) =>
                prev.map((doc) => {
                    const match = resultados.find((r: any) => r.archivo_temporal === doc.tempPath);
                    if (!match) return doc;
                    if (match.error) {
                        return { ...doc, status: "error", error: match.error };
                    }
                    return { ...doc, status: "procesado", result: match.resultado };
                })
            );
            fetchFolderCounts();
        } catch (error) {
            console.error("Error al procesar lote:", error);
            setDocuments((prev) => prev.map((doc) => (doc.status === "procesando" ? { ...doc, status: "error", error: "Error al procesar" } : doc)));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVaciarCarpeta = async (tipo: string, label: string) => {
        const ok = window.confirm(`¿Vaciar la carpeta ${label}?`);
        if (!ok) return;

        try {
            const response = await fetch(`${backendUrl}/documentos/${tipo}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status} al vaciar carpeta`);
            }
            fetchFolderCounts();
        } catch (error) {
            console.error("Error al vaciar carpeta:", error);
        }
    };

    const carpetasSesion = {
        Facturas: documents.filter((doc) => doc.result?.tipo_documento === "Facturas"),
        Declaraciones_Juradas: documents.filter((doc) => doc.result?.tipo_documento === "Declaraciones_Juradas"),
        NITs: documents.filter((doc) => doc.result?.tipo_documento === "NITs"),
        No_Reconocidos: documents.filter((doc) =>
            doc.result?.tipo_documento === "No reconocido" || doc.result?.tipo_documento === "Ninguno"
        ),
    };

    return (
        <div className="min-h-screen bg-white text-[#021024] flex font-dm-sans overflow-hidden">

            {/* ================= SIDEBAR ================= */}
            <aside className="w-64 border-r border-[#5483B3]/20 bg-[#021024] flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-[#5483B3]/10">
                    <span className="font-unbounded font-bold text-sm text-white">Visión Contable</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#052659] text-white text-sm font-medium border-l-2 border-[#5483B3] transition-colors cursor-default">
                        Clasificar lote
                    </button>
                </nav>

                <div className="px-4 pb-6">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Carpetas</div>
                    <div className="space-y-2.5 text-sm">
                        {[
                            { key: "Facturas", label: "Facturas" },
                            { key: "Declaraciones_Juradas", label: "Declaraciones" },
                            { key: "NITs", label: "NITs" },
                            { key: "No_Reconocidos", label: "No reconocidos" },
                        ].map((item) => {
                            const count = folderCounts[item.key] || 0;
                            const disabled = count === 0;
                            const href = `${backendUrl}/documentos/${item.key}/descargar`;
                            return (
                                <div key={item.key} className="border border-[#5483B3]/20 px-3.5 py-3 bg-[#052659]/30 hover:bg-[#052659]/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-medium text-sm">{item.label}</span>
                                        <span className="text-[#C1E8FF] text-xs font-semibold px-2 py-0.5 bg-[#021024]">{count}</span>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-4 text-xs">
                                        {disabled ? (
                                            <span className="text-gray-500 cursor-not-allowed font-medium">Descargar</span>
                                        ) : (
                                            <a className="text-[#C1E8FF] hover:text-white hover:underline transition-colors font-medium" href={href}>Descargar</a>
                                        )}
                                        <button
                                            disabled={disabled}
                                            onClick={() => handleVaciarCarpeta(item.key, item.label)}
                                            className="text-red-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
                                        >
                                            Vaciar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-[#5483B3]/10" />
            </aside>

            {/* ================= ÁREA PRINCIPAL ================= */}
            <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-white">

                <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 z-10 bg-white">
                    <h1 className="font-unbounded font-bold text-lg text-[#021024]">
                        Clasificación de documentos
                    </h1>
                    <Link href="/">
                        <button className="text-sm border border-[#021024] px-4 py-2 text-[#021024] hover:bg-[#021024] hover:text-white transition-colors duration-200">
                            Volver al inicio
                        </button>
                    </Link>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full z-10 flex-1 flex flex-col">

                    {/* ================= DROPZONE CON INPUT REAL ================= */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-[#021024]">Subir archivos</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleProcesarLote}
                                    disabled={isProcessing || documents.length === 0}
                                    className="text-sm bg-[#052659] text-white px-5 py-2 font-medium hover:bg-[#021024] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? "Procesando..." : "Procesar lote"}
                                </button>
                                <a
                                    href={`${backendUrl}/resultados/export/excel`}
                                    className="text-sm border border-[#5483B3]/40 px-4 py-2 text-[#052659] hover:bg-[#C1E8FF]/10 transition-colors font-medium"
                                >
                                    Exportar Excel
                                </a>
                                <a
                                    href={`${backendUrl}/resultados/export/pdf`}
                                    className="text-sm border border-[#5483B3]/40 px-4 py-2 text-[#052659] hover:bg-[#C1E8FF]/10 transition-colors font-medium"
                                >
                                    Exportar PDF
                                </a>
                            </div>
                        </div>

                        {/* Input oculto que recibe el archivo */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".jpg,.jpeg,.png"
                            multiple
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-56 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading
                                    ? "border-[#052659] bg-[#C1E8FF]/10"
                                    : "border-[#5483B3]/40 bg-[#C1E8FF]/5 hover:bg-[#C1E8FF]/10 hover:border-[#052659]"
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={36} className="text-[#052659] animate-spin mb-4" />
                                    <span className="text-[#021024] text-base font-semibold">Subiendo documentos...</span>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={36} className="text-[#5483B3] mb-4" />
                                    <span className="text-[#021024] text-base font-semibold">Haz clic para buscar documentos</span>
                                    <span className="text-gray-500 text-sm mt-1">Formatos soportados: JPG, PNG</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ================= HISTORIAL DE PROCESAMIENTO ================= */}
                    <div className="flex-1">
                        <h2 className="font-semibold text-[#021024] mb-4">Documentos en proceso</h2>

                        {documents.length === 0 ? (
                            <div className="w-full border border-gray-100 bg-gray-50 p-8 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-40">
                                <File size={24} className="mb-2 opacity-40" />
                                Sin documentos cargados
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between border border-gray-100 bg-white p-4 hover:border-[#5483B3]/40 hover:shadow-[2px_2px_0px_0px_rgba(5,38,89,0.05)] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 flex items-center justify-center ${doc.status === "procesado" ? 'bg-[#052659] text-white' : 'bg-[#C1E8FF]/20 text-[#052659]'}`}>
                                                <File size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#021024]">{doc.name}</div>
                                                {doc.result?.tipo_documento && (
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {doc.result.tipo_documento} · Confianza: {(doc.result.confianza_documento * 100).toFixed(0)}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            {doc.status === "procesado" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                                                    <CheckCircle2 size={14} />
                                                    Procesado
                                                </span>
                                            )}
                                            {doc.status === "procesando" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/50">
                                                    <Loader2 size={14} className="animate-spin" />
                                                    Procesando
                                                </span>
                                            )}
                                            {doc.status === "en_cola" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                                                    En cola
                                                </span>
                                            )}
                                            {doc.status === "error" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-800 border border-red-200/50">
                                                    {doc.error || "Error"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ================= CARPETAS VISUALES DE SESION ================= */}
                    <div className="mt-10">
                        <h2 className="font-semibold text-[#021024] mb-4">Carpetas de sesión</h2>
                        <div className="grid md:grid-cols-2 gap-4 items-start">
                            {[
                                { key: "Facturas", label: "Facturas" },
                                { key: "Declaraciones_Juradas", label: "Declaraciones Juradas" },
                                { key: "NITs", label: "NITs" },
                                { key: "No_Reconocidos", label: "No reconocidos" },
                            ].map((item) => {
                                const docs = carpetasSesion[item.key as keyof typeof carpetasSesion] || [];
                                const count = docs.length;
                                const href = `${backendUrl}/documentos/${item.key}/descargar`;
                                const isOpen = openFolders[item.key] ?? false;
                                return (
                                    <div key={item.key} className="border border-gray-100 bg-white overflow-hidden self-start hover:border-gray-200 transition-all shadow-sm">
                                        <button
                                            onClick={() =>
                                                setOpenFolders((prev) => ({
                                                    ...prev,
                                                    [item.key]: !isOpen,
                                                }))
                                            }
                                            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isOpen ? (
                                                    <ChevronDown size={16} className="text-gray-400" />
                                                ) : (
                                                    <ChevronRight size={16} className="text-gray-400" />
                                                )}
                                                <Folder size={18} className="text-[#052659]" />
                                                <span className="text-[#021024] text-sm font-semibold">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <span className="text-gray-500 text-sm font-semibold">{count}</span>
                                        </button>

                                        {isOpen && (
                                            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                                    {count === 0 ? (
                                                        <div className="text-gray-400 text-sm">Sin documentos en esta sesión</div>
                                                    ) : (
                                                        docs.map((doc) => (
                                                            <div key={doc.id} className="text-[#021024] text-sm truncate py-1 border-b border-gray-100 last:border-b-0">
                                                                {doc.name}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-2 border-t border-gray-100/55">
                                                    {count === 0 ? (
                                                        <span className="inline-block px-3 py-1.5 text-xs font-semibold text-gray-300 border border-gray-200 cursor-not-allowed">
                                                            Descargar ZIP
                                                        </span>
                                                    ) : (
                                                        <a 
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#052659] text-[#052659] hover:bg-[#052659] hover:text-white transition-colors" 
                                                            href={href}
                                                        >
                                                            Descargar ZIP
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}