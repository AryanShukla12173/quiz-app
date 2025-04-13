'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import DOMPurify from 'isomorphic-dompurify';


interface Challenge {
  id: string;
  title: string;
  description: string;
  defaultCode: string;
  language: string;
  version: string;
  testCases: { input: string; expected: string }[];
}

const languages = [
  { label: 'Java', value: 'java', version: '15.0.2' },
  { label: 'Python', value: 'python3', version: '3.10.0' },
  { label: 'C++', value: 'cpp', version: '10.2.0' },
  { label: 'C', value: 'c', version: '10.2.0' },
  { label: 'JavaScript', value: 'javascript', version: '18.15.0' },
  { label: 'Go', value: 'go', version: '1.20.5' },
];

export default function Page() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeId, setActiveId] = useState('');
  const [codeStore, setCodeStore] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('challengeCode') || '{}');
    }
    return {};
  });
  const [output, setOutput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; output: string }[]>([]);

  const activeChallenge = challenges.find(c => c.id === activeId);

  const updateCode = (id: string, code: string) => {
    const updated = { ...codeStore, [id]: code };
    setCodeStore(updated);
    localStorage.setItem('challengeCode', JSON.stringify(updated));
  };

  const runCode = async () => {
    const langMeta = languages.find(l => l.value === selectedLanguage)!;
    const code = codeStore[activeId] || activeChallenge?.defaultCode;
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langMeta.value,
        version: langMeta.version,
        files: [{ name: 'Main.' + langMeta.value, content: code }],
        stdin: input,
      }),
    });
    const data = await res.json();
    setOutput(data.run.output || data.run.stderr || '');
  };

  const handleSubmit = async () => {
    const langMeta = languages.find(l => l.value === selectedLanguage)!;
    const code = codeStore[activeId] || activeChallenge?.defaultCode;
    const results = await Promise.all(
      (activeChallenge?.testCases || []).map(async (test) => {
        const res = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: langMeta.value,
            version: langMeta.version,
            files: [{ name: 'Main.' + langMeta.value, content: code }],
            stdin: test.input,
          }),
        });
        const data = await res.json();
        const output = data.run.output || data.run.stderr || '';
        return {
          passed: output.trim() === test.expected.trim(),
          input: test.input,
          expected: test.expected,
          output,
        };
      })
    );
    setTestResults(results);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all(
      Array.from({ length: 10 }).map(() =>
        fetch('https://leetcode-api-pied.vercel.app/random')
          .then(res => res.json())
          .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.content, 'text/html');
            const exampleElements = Array.from(doc.querySelectorAll('pre'));

            const testCases = exampleElements.map((exampleEl) => {
              const lines = exampleEl.textContent?.trim().split('\n') || [];
              let input = '', expected = '';
              lines.forEach(line => {
                if (line.toLowerCase().startsWith('input')) input = line.replace(/.*?:\s*/, '');
                else if (line.toLowerCase().startsWith('output')) expected = line.replace(/.*?:\s*/, '');
              });
              return input && expected ? { input, expected } : null;
            }).filter(Boolean) as { input: string; expected: string }[];

            return {
              id: data.titleSlug,
              title: data.title,
              description: data.content,
              defaultCode: '// Write your solution here',
              language: 'java',
              version: '15.0.2',
              testCases,
            } as Challenge;
          })
      )
    ).then(loaded => {
      setChallenges(loaded);
      if (loaded.length > 0) setActiveId(loaded[0].id);
    });
  }, []);

  useEffect(() => {
    const defaultCode = challenges.find(c => c.id === activeId)?.defaultCode;
    const challengeLang = challenges.find(c => c.id === activeId)?.language;
    setSelectedLanguage(challengeLang || 'java');
    setCodeStore(prev => ({ ...prev, [activeId]: defaultCode || '' }));
  }, [activeId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="h-screen grid grid-cols-[200px_1fr]">
      <aside className="border-r h-full p-2 bg-muted">
        <h2 className="font-bold text-sm mb-2">Challenges</h2>
        <ScrollArea className="h-full pr-2 space-y-1">
          {challenges.map(ch => (
            <div
              key={ch.id}
              onClick={() => setActiveId(ch.id)}
              className={`p-2 rounded cursor-pointer hover:bg-primary/10 ${
                ch.id === activeId ? 'bg-primary text-white' : ''
              }`}
            >
              {ch.title}
            </div>
          ))}
        </ScrollArea>
      </aside>

      <main className="p-4 grid grid-rows-[auto_1fr_auto] gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{activeChallenge?.title}</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="font-mono text-red-600">Time left: {formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <Card className="p-2 h-[400px]">
            <Editor
              theme="vs-dark"
              language={selectedLanguage}
              value={codeStore[activeId] ?? activeChallenge?.defaultCode}
              onChange={value => updateCode(activeId, value || '')}
            />
          </Card>
          <Tabs defaultValue="problem" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="submit">Submit</TabsTrigger>
            </TabsList>
            <TabsContent value="problem">
              <Card className="p-4 text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeChallenge?.description || '') }} />
            </TabsContent>
            <TabsContent value="test">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter input here..."
                className="text-sm p-2 border rounded h-20 resize-none mb-2"
              />
              <div className="text-sm bg-gray-100 rounded p-2 whitespace-pre-wrap">
                {output}
              </div>
              <div className="flex justify-end mt-2">
                <Button onClick={runCode}>Run</Button>
              </div>
            </TabsContent>
            <TabsContent value="submit">
              <div className="flex justify-end mb-2">
                <Button onClick={handleSubmit} variant="secondary">Submit</Button>
              </div>
              <Card className="p-4">
                <h2 className="text-md font-semibold mb-2">Test Cases</h2>
                <ul className="space-y-2 text-sm">
                  {testResults.map((result, idx) => (
                    <li key={idx} className={result.passed ? 'text-green-600' : 'text-red-600'}>
                      Input: <code>{result.input}</code> | Expected: <code>{result.expected.trim()}</code> | Output: <code>{result.output.trim()}</code>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
