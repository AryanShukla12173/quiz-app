'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const challengeCodes: Record<string, string> = {
  JAVA123: '1',
  SUM456: '2',
};

export default function Page() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStart = () => {
    const challengeId = challengeCodes[code.toUpperCase()];
    if (challengeId) {
      router.push(`challenges/start/${challengeId}`);
    } else {
      setError('Invalid challenge code');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Enter Challenge Code</h1>
      <Input
        placeholder="e.g. JAVA123"
        value={code}
        onChange={e => setCode(e.target.value)}
        className="w-64"
      />
      <Button onClick={handleStart}>Start Challenge</Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
