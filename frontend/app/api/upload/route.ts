import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

function normalizeFilename(input: string): string {
    const cleaned = input.trim().replace(/\\/g, '/').split('/').pop() || 'archivo';
    const safe = cleaned
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._ -]/g, '_')
        .replace(/\s+/g, '_');
    return safe || 'archivo';
}

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
        const safeFilename = normalizeFilename(filename);
        const blob = await put(`${Date.now()}_${safeFilename}`, request.body, {
            access: 'public',
        });

        return NextResponse.json({
            ...blob,
            url: blob.url,
            downloadUrl: blob.downloadUrl,
        });
    } catch (error) {
        console.error('Blob upload error:', error);
        const detail = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                error: 'Error al subir el archivo a Vercel Blob',
                detail,
            },
            { status: 500 }
        );
    }
}