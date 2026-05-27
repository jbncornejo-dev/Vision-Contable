import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'El nombre del archivo es obligatorio' }, { status: 400 });
    }

    if (!request.body) {
        return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    try {
        // Put
        const blob = await put(filename, request.body, {
            access: 'public',
        });

        // Devolvemos la URL pública que Vercel acaba de generar
        return NextResponse.json(blob);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al subir el archivo a Vercel Blob' }, { status: 500 });
    }
}