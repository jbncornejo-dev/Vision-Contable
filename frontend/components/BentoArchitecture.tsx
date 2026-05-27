"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function BentoArchitecture() {
    return (
        <section id="flujo" className="px-6 max-w-7xl mx-auto py-32">
            <div className="mb-16">
                <h2 className="font-unbounded font-black text-3xl md:text-5xl text-[#021024]">
                    Cómo funciona
                </h2>
                <p className="font-dm-sans text-[#5483B3] mt-2 text-lg">
                    Una vista clara del proceso y sus etapas
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 border border-gray-200 bg-white p-8"
                >
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <h3 className="font-unbounded font-bold text-2xl text-[#021024] mb-4">Control de calidad</h3>
                            <p className="font-dm-sans text-gray-600 max-w-lg mb-8">
                                Se filtran documentos borrosos o incompletos para asegurar que el resto del flujo sea estable y confiable.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { title: "Legibilidad", desc: "Verificación de nitidez y contraste." },
                                { title: "Integridad", desc: "Validación de campos mínimos requeridos." },
                                { title: "Formato", desc: "Compatibilidad de la estructura del archivo." }
                            ].map((item) => (
                                <div key={item.title} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check size={18} className="text-[#052659]" />
                                        <span className="font-semibold text-[#021024]">{item.title}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="border border-gray-200 bg-white p-8 flex flex-col justify-between"
                >
                    <div>
                        <h3 className="font-unbounded font-bold text-2xl text-[#021024] mb-4">Enderezado automático</h3>
                        <p className="font-dm-sans text-gray-600 mb-8">
                            Se detecta la orientación y se corrige automáticamente para mejorar la lectura.
                        </p>
                    </div>
                    <div className="flex justify-center items-center h-28 border border-gray-200 bg-gray-50 group overflow-hidden">
                        <div className="w-16 h-20 border border-gray-300 bg-white shadow-sm -rotate-12 transition-transform duration-700 ease-in-out group-hover:rotate-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-300">DOC</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-3 border border-gray-200 bg-white p-8 flex flex-col md:flex-row items-center gap-8"
                >
                    <div className="flex-1">
                        <h3 className="font-unbounded font-bold text-2xl text-[#021024] mb-4">Clasificación y guardado</h3>
                        <p className="font-dm-sans text-gray-600">
                            Cada documento analizado se clasifica automáticamente y se envía a su categoría correspondiente para su revisión final y posterior exportación.
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                        {[
                            { name: "Facturas" },
                            { name: "Contratos" },
                            { name: "NITs" }
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="flex-1 border border-gray-200 bg-gray-50 p-4 text-center hover:bg-white transition-colors cursor-default"
                            >
                                <span className="font-medium text-[#021024]">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}