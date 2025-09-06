import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from('images').list('public');
      if (data) {
        const urls = data
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
          .map(file =>
            supabase.storage.from('images').getPublicUrl(`public/${file.name}`).publicUrl
          );
        setImages(urls);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center p-4">
      {loading && <div>Loading images...</div>}
      {images.map(url => (
        <img key={url} src={url} alt="Gallery" style={{ maxWidth: 200, borderRadius: 8 }} />
      ))}
      {!loading && images.length === 0 && <div>No images found.</div>}
    </div>
  );
}
