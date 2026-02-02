import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Vérifier que le token Blob est configuré
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ 
        error: 'BLOB_READ_WRITE_TOKEN non configuré. Ajoute Blob Storage dans Vercel.' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Aucun nom fourni' }, { status: 400 });
    }

    // Nettoyer le nom pour le nom de fichier
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Obtenir l'extension du fichier
    const fileExtension = file.name.split('.').pop() || 'gif';
    const fileName = `valentine/${cleanName}.${fileExtension}`;

    // Convertir le File en ArrayBuffer pour Vercel Blob (fix content-length header)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Vercel Blob avec le buffer et le content-type
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ 
      success: true, 
      fileName,
      imagePath: blob.url
    });

  } catch (error: any) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de l\'upload' 
    }, { status: 500 });
  }
}
