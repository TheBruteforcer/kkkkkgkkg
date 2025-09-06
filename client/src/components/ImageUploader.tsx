import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    if (!file) return;
    setLoading(true);
    const { error } = await supabase.storage
      .from('images')
      .upload(`public/${file.name}`, file, { upsert: true });
    if (error) {
      alert('Upload error: ' + error.message);
    } else {
      const { data: publicUrl } = supabase.storage
        .from('images')
        .getPublicUrl(`public/${file.name}`);
      setUrl(publicUrl.publicUrl);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-xl shadow-md">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={uploadImage} disabled={loading || !file} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {url && <img src={url} alt="Uploaded" style={{ maxWidth: 300, borderRadius: 12, marginTop: 8 }} />}
    </div>
  );
}
