import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    // Si pas de token configuré, retourner vide
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ images: [], imageForName: null });
    }

    // Lister tous les blobs dans le dossier valentine/
    const { blobs } = await list({ prefix: 'valentine/' });

    // Si un nom est fourni, chercher l'image correspondante
    let imageForName = null;
    if (name) {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const matchingBlob = blobs.find(b => {
        const blobName = b.pathname.replace('valentine/', '').split('.')[0];
        return blobName === cleanName;
      });
      if (matchingBlob) {
        imageForName = matchingBlob.url;
      }
    }

    return NextResponse.json({ 
      images: blobs.map(b => ({
        name: b.pathname.replace('valentine/', '').replace(/\.[^.]+$/, ''),
        path: b.url
      })),
      imageForName
    });

  } catch (error) {
    console.error('Erreur lecture images:', error);
    // Retourner un tableau vide si le blob storage n'est pas configuré
    return NextResponse.json({ images: [], imageForName: null });
  }
}
