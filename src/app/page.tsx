'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [origin, setOrigin] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    const cleanName = name.trim();
    
    if (!cleanName) {
      setUploadStatus('⚠️ Veuillez d\'abord entrer un nom');
      return;
    }

    if (!file) {
      setUploadStatus('⚠️ Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    setUploadStatus('⏳ Upload en cours...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', cleanName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus(`✅ Image uploadée : ${data.imagePath}`);
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus('❌ Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const generateLink = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setUploadStatus('⚠️ Veuillez entrer un nom');
      return;
    }

    const link = `${origin}/${encodeURIComponent(cleanName)}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setUploadStatus('📋 Lien copié !');
  };

  return (
    <div className="container admin-container">
      <h1>Générateur de Saint-Valentin 💘</h1>
      
      <div className="input-group">
        <input 
          className="admin-input"
          type="text" 
          placeholder="Nom de l'amoureuse" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <div className="upload-section">
          <label className="file-label">
            📷 Choisir une image,pas obligé, y aura le gif hamster explosion, priviligiez les photos carré
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,.gif"
              onChange={handleFileSelect}
              className="file-input"
            />
          </label>
          
          {previewImage && (
            <div className="preview-container">
              <img src={previewImage} alt="Preview" className="preview-image" />
              <button 
                onClick={handleUpload}
                className="btn upload-btn"
                disabled={uploading}
              >
                {uploading ? '⏳ Upload...' : '📤 Uploader l\'image'}
              </button>
            </div>
          )}
        </div>

        {uploadStatus && (
          <p className="upload-status">{uploadStatus}</p>
        )}

        <button 
          onClick={generateLink}
          className="btn" 
          id="yesBtn"
        >
          Créer le lien magique
        </button>
      </div>

      {generatedLink && (
        <div className="link-result">
          <p>Voici ton lien :</p>
          <a href={generatedLink} target="_blank" rel="noopener noreferrer">
            {generatedLink}
          </a>
          <button onClick={copyToClipboard} className="btn copy-btn">
            📋 Copier
          </button>
        </div>
      )}
    </div>
  );
}