'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function ValentinePage() {
  const params = useParams();
  
  // On décode le nom pour gérer les accents et espaces
  const name = decodeURIComponent(params.name as string);
  const defaultImage = "/images/default.gif";
  const [displayImage, setDisplayImage] = useState(defaultImage);

  const [accepted, setAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  // Gestion du bouton NON qui fuit
  const handleNoHover = () => {
    if (!noBtnRef.current) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const btnWidth = noBtnRef.current.offsetWidth;
    const btnHeight = noBtnRef.current.offsetHeight;

    const newX = Math.random() * (windowWidth - btnWidth);
    const newY = Math.random() * (windowHeight - btnHeight);

    noBtnRef.current.style.position = 'fixed';
    noBtnRef.current.style.left = `${newX}px`;
    noBtnRef.current.style.top = `${newY}px`;
    noBtnRef.current.style.zIndex = '200';
  };

  // Gestion des cœurs flottants
  const startFloatingHearts = () => {
    const interval = setInterval(() => {
      const heart = document.createElement('div');
      heart.classList.add('floating-heart');
      heart.innerHTML = '💖';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.top = Math.random() * 100 + 'vh';
      const size = (Math.random() * 2 + 1) + 'rem';
      heart.style.fontSize = size;
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 2000);
    }, 20);

    return () => clearInterval(interval);
  };

  // Gestion des explosions de confettis
  const triggerExplosions = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ffa500'],
        shapes: ['heart' as any], // Correction TypeScript ici
        zIndex: 9999
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff69b4', '#ffd700'],
        shapes: ['heart' as any], // Correction TypeScript ici
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Clic sur OUI
  const handleYesClick = () => {
    document.body.classList.add('party-mode');
    triggerExplosions();
    startFloatingHearts();
    setAccepted(true);

    setTimeout(() => {
      setShowSuccess(true);
    }, 1000);
  };

  // Charger l'image associée au nom
  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(`/api/images?name=${encodeURIComponent(name)}`);
        const data = await response.json();
        if (data.imageForName) {
          setDisplayImage(data.imageForName);
        }
      } catch (error) {
        console.error('Erreur chargement image:', error);
      }
    };
    loadImage();
  }, [name]);

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      document.body.classList.remove('party-mode');
    };
  }, []);

  // Affichage de l'écran de succès
  if (showSuccess) {
    return (
      <div id="success-container">
        <h1>YEAAAAH ! LA MEILLEURE DÉCISION ! 🥰🎉</h1>
        <img src={displayImage} alt="Success Gif" />
      </div>
    );
  }

  // Affichage de la question
  return (
    <div className="container" id="question-container" style={{ display: accepted ? 'none' : 'block' }}>
      <h1>{name}, veux-tu être ma Valentine ? 💖</h1>
      <div className="button-box">
        <button 
          className="btn" 
          id="yesBtn" 
          onClick={handleYesClick}
        >
          Oui
        </button>
        <button 
          className="btn" 
          id="noBtn" 
          ref={noBtnRef}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
        >
          Non
        </button>
      </div>
    </div>
  );
}