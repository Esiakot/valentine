import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
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

    // Supprimer l'ancienne image si elle existe
    try {
      const { blobs } = await list({ prefix: `valentine/${cleanName}.` });
      // Les anciennes images seront écrasées par le même nom
    } catch (e) {
      // Ignorer si pas d'images existantes
    }

    // Upload vers Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ 
      success: true, 
      fileName,
      imagePath: blob.url
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
