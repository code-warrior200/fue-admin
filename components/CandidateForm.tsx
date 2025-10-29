import { useState } from 'react';

const addCandidate = async (candidate: { name: string; position: string; image?: File }) => {
  const formData = new FormData();
  formData.append('name', candidate.name);
  formData.append('position', candidate.position);
  if (candidate.image) formData.append('image', candidate.image);

  const res = await fetch('/api/candidates', {
    method: 'POST',
    body: formData, // multipart/form-data
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to add candidate: ${res.status} ${text}`);
  }

  return res.json();
};

interface CandidateFormProps {
  onCandidateAdded?: () => void;
}

export default function CandidateForm({ onCandidateAdded }: CandidateFormProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCandidate({ name, position, image: image ?? undefined });
      setName('');
      setPosition('');
      setImage(null);
      if (onCandidateAdded) onCandidateAdded();
    } catch (err) {
      console.error('Error adding candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Candidate Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Candidate'}
      </button>
    </form>
  );
}
