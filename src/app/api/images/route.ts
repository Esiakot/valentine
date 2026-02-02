import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    if (!existsSync(imagesDir)) {
      return NextResponse.json({ images: [], imageForName: null });
    }

    const files = await readdir(imagesDir);
    const imageFiles = files.filter(f => 
      /\.(gif|jpg|jpeg|png|webp)$/i.test(f) && f !== 'default.gif'
    );

    // Si un nom est fourni, chercher l'image correspondante
    let imageForName = null;
    if (name) {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const matchingImage = files.find(f => f.startsWith(cleanName + '.'));
      if (matchingImage) {
        imageForName = `/images/${matchingImage}`;
      }
    }

    return NextResponse.json({ 
      images: imageFiles.map(f => ({
        name: f.replace(/\.[^.]+$/, ''),
        path: `/images/${f}`
      })),
      imageForName
    });

  } catch (error) {
    console.error('Erreur lecture images:', error);
    return NextResponse.json({ error: 'Erreur lors de la lecture' }, { status: 500 });
  }
}
