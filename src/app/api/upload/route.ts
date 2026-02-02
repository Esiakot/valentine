import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
    const fileName = `${cleanName}.${fileExtension}`;

    // Créer le dossier images s'il n'existe pas
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = path.join(imagesDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      fileName,
      imagePath: `/images/${fileName}`
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
