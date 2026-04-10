import { useState, useEffect, useRef } from 'react';

function AudioPlayer({ audioBase64, autoPlay, onEnded }) {
  const [audioInstance, setAudioInstance] = useState(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!audioBase64) return;

    if (audioInstance) {
      audioInstance.pause();
      audioInstance.src = '';
    }

    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
    const newUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(newUrl);

    audio.onended = () => {
      if (onEndedRef.current) onEndedRef.current();
    };

    setAudioInstance(audio);

    if (autoPlay) {
      audio.play().catch((err) => {
        console.error('Audio autoplay failed:', err.message);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
      URL.revokeObjectURL(newUrl);
    };
  }, [audioBase64]);

  return null;
}

export default AudioPlayer;