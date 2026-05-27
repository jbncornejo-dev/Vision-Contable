"use client";

import { motion } from "framer-motion";

export default function BentoArchitecture() {
    return (
        <section className="px-6 max-w-7xl mx-auto py-32">
            <div className="mb-16">
                <h2 className="font-unbounded font-black text-3xl md:text-5xl uppercase text-[#021024]">
                    Arquitectura Base
                </h2>
                <p className="font-share-tech text-[#5483B3] mt-2 tracking-widest">
          // INFRAESTRUCTURA DE MODELOS CONVOLUCIONALES
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta 1: Filtro de Calidad (Ocupa 2 columnas) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 border border-[#5483B3]/30 bg-[#C1E8FF]/10 backdrop-blur-md rounded-xl p-8 hover:bg-[#C1E8FF]/20 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="font-share-tech text-xs text-[#052659] mb-4 border border-[#5483B3]/30 inline-block px-2 py-1 bg-white/50 rounded-sm">
                            [ MODELO_01 ]
                        </div>
                        <h3 className="font-unbounded font-bold text-2xl text-[#021024] uppercase mb-4">Filtro Binario de Calidad</h3>
                        <p className="font-space-grotesk text-[#021024]/80 max-w-lg">
                            Red Neuronal entrenada desde cero para descartar imágenes desenfocadas o movidas. Previene el gasto computacional innecesario en las siguientes capas y reduce la tasa de falsos positivos en un 99%.
                        </p>
                    </div>
                    <div className="mt-8 h-20 w-full bg-gradient-to-r from-red-500/10 to-green-500/10 border-t border-dashed border-[#5483B3]/30 flex items-center justify-between px-4 font-share-tech text-xs">
                        <span className="text-red-600 font-bold blur-[1px]">RECHAZO (loss: 0.02)</span>
                        <span className="text-green-700 font-bold">APROBADO (acc: 0.99)</span>
                    </div>
                </motion.div>

                {/* Tarjeta 2: Orientación */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="border border-[#5483B3]/30 bg-[#C1E8FF]/10 backdrop-blur-md rounded-xl p-8 hover:bg-[#C1E8FF]/20 transition-all"
                >
                    <div className="font-share-tech text-xs text-[#052659] mb-4 border border-[#5483B3]/30 inline-block px-2 py-1 bg-white/50 rounded-sm">
                        [ MODELO_02 ]
                    </div>
                    <h3 className="font-unbounded font-bold text-2xl text-[#021024] uppercase mb-4">Auto Orientación</h3>
                    <p className="font-space-grotesk text-[#021024]/80 text-sm mb-6">
                        Clasificación multiclase geométrica. Detecta el ángulo del documento (0°, 90°, 180°, 270°) y aplica rotación matricial automática.
                    </p>
                    <div className="flex justify-center items-center h-24 relative border border-[#5483B3]/20 bg-white/50">
                        <motion.div
                            className="w-12 h-16 border-2 border-[#021024] bg-white flex items-center justify-center font-share-tech font-bold text-[#052659]"
                            animate={{ rotate: [0, 0, 90, 90, 180, 180, 270, 270, 360] }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.95, 1]
                            }}
                        >
                            DOC
                        </motion.div>
                    </div>
                </motion.div>

                {/* Tarjeta 3: Clasificación Final (Ocupa 3 columnas) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-3 border border-[#5483B3]/30 bg-[#C1E8FF]/10 backdrop-blur-md rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-[#C1E8FF]/20 transition-all"
                >
                    <div className="flex-1">
                        <div className="font-share-tech text-xs text-[#052659] mb-4 border border-[#5483B3]/30 inline-block px-2 py-1 bg-white/50 rounded-sm">
                            [ MODELO_03 ]
                        </div>
                        <h3 className="font-unbounded font-bold text-2xl text-[#021024] uppercase mb-4">Estructura & Enrutamiento</h3>
                        <p className="font-space-grotesk text-[#021024]/80">
                            Red Neuronal Convolucional profunda que extrae patrones estructurales (tablas, logos, densidades de texto) para clasificar y almacenar los documentos en sus bases de datos correspondientes.
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                        {['/FACTURAS', '/CONTRATOS', '/NITS'].map((item) => (
                            <div key={item} className="flex-1 h-20 border border-[#5483B3]/40 bg-white/80 rounded-sm flex items-center justify-center font-share-tech text-sm text-[#052659] shadow-sm hover:bg-[#052659] hover:text-white transition-colors cursor-default">
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}