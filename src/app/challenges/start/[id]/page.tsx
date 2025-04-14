'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
  hidden: boolean;
}

interface Challenge {
  title: string;
  description: string;
  language: string;
  testcases: TestCase[];
}

interface CodeTest {
  testTitle: string;
  testDescription: string;
  challenges: Challenge[];
}

// Define language configurations with proper file extensions and version information
const languages = [
  { label: 'Java', value: 'java', version: '17', file: 'Main.java' },
  { label: 'Python', value: 'python', version: '3.10.0', file: 'main.py' },
  { label: 'C++', value: 'cpp', version: '10.2.0', file: 'main.cpp' },
  { label: 'C', value: 'c', version: '10.2.0', file: 'main.c' },
  { label: 'JavaScript', value: 'nodejs', version: '18.15.0', file: 'index.js' },
  { label: 'Go', value: 'go', version: '1.20.5', file: 'main.go' },
];

// Updated minimal boilerplate code templates
const boilerplateCode = {
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        scanner.close();
        
        int result = solution(a, b);
        System.out.println(result);
    }
    
    public static int solution(int a, int b) {
        // Your code here
        return a + b;
    }
}`,
  python: `def solution(a, b):
    # Your code here
    return a + b

# Read input and execute
a, b = map(int, input().split())
result = solution(a, b)
print(result)`,
  nodejs: `function solution(a, b) {
  // Your code here
  return a + b;
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const [a, b] = line.split(' ').map(Number);
  const result = solution(a, b);
  console.log(result);
  rl.close();
});`,
  cpp: `#include <iostream>
#include <string>
#include <sstream>

int solution(int a, int b) {
    // Your code here
    return a + b;
}

int main() {
    std::string line;
    std::getline(std::cin, line);
    std::istringstream ss(line);
    
    int a, b;
    ss >> a >> b;
    
    int result = solution(a, b);
    std::cout << result << std::endl;
    
    return 0;
}`,
  c: `#include <stdio.h>

int solution(int a, int b) {
    // Your code here
    return a + b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    
    int result = solution(a, b);
    printf("%d\\n", result);
    
    return 0;
}`,
  go: `package main

import (
    "fmt"
    "strings"
    "strconv"
)

func solution(a, b int) int {
    // Your code here
    return a + b
}

func main() {
    var input string
    fmt.Scanln(&input)
    
    parts := strings.Split(input, " ")
    a, _ := strconv.Atoi(parts[0])
    b, _ := strconv.Atoi(parts[1])
    
    result := solution(a, b)
    fmt.Println(result)
}`,
};

export default function Page() {
  // Sample test data with multiple challenges
  const codeTestData: CodeTest = {
    "testTitle": "Challenge Test 1",
    "testDescription": "Used for test",
    "challenges": [
      {
        "title": "Sum of two numbers",
        "description": "Write a function that adds two numbers and returns the output",
        "language": "python",
        "testcases": [
          {
            "input": "10 20",
            "expectedOutput": "30",
            "description": "Basic addition",
            "hidden": false
          },
          {
            "input": "-5 10",
            "expectedOutput": "5",
            "description": "Adding negative and positive",
            "hidden": false
          },
          {
            "input": "0 0",
            "expectedOutput": "0",
            "description": "Adding zeros",
            "hidden": true
          }
        ]
      },
      {
        "title": "Multiply two numbers",
        "description": "Write a function that multiplies two numbers and returns the output",
        "language": "python",
        "testcases": [
          {
            "input": "5 6",
            "expectedOutput": "30",
            "description": "Basic multiplication",
            "hidden": false
          },
          {
            "input": "-2 4",
            "expectedOutput": "-8",
            "description": "Negative multiplication",
            "hidden": false
          }
        ]
      },
      {
        "title": "Factorial",
        "description": "Write a function that calculates the factorial of a number",
        "language": "python",
        "testcases": [
          {
            "input": "5",
            "expectedOutput": "120",
            "description": "Factorial of 5",
            "hidden": false
          }
        ]
      },
      {
        "title": "Check prime number",
        "description": "Write a function that checks if a number is prime",
        "language": "python",
        "testcases": [
          {
            "input": "7",
            "expectedOutput": "True",
            "description": "7 is prime",
            "hidden": false
          }
        ]
      },
      {
        "title": "Calculate area of circle",
        "description": "Write a function that calculates the area of a circle",
        "language": "python",
        "testcases": [
          {
            "input": "5",
            "expectedOutput": "78.54",
            "description": "Area of circle with radius 5",
            "hidden": false
          }
        ]
      },
      {
        "title": "String reverse",
        "description": "Write a function that reverses a string",
        "language": "python",
        "testcases": [
          {
            "input": "hello",
            "expectedOutput": "olleh",
            "description": "Reverse 'hello'",
            "hidden": false
          }
        ]
      }
    ]
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [codeStore, setCodeStore] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; output: string }[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const activeChallenge = codeTestData.challenges[activeIndex];

  useEffect(() => {
    // Initialize code store with boilerplate code for each challenge
    const initialCodeStore: Record<string, string> = {};
    codeTestData.challenges.forEach((challenge, index) => {
      const languageKey = mapLanguageToKey(challenge.language);
      initialCodeStore[`${index}-${languageKey}`] = boilerplateCode[languageKey];
    });
    setCodeStore(initialCodeStore);
    
    // Set first challenge as active
    if (codeTestData.challenges.length > 0) {
      setActiveIndex(0);
      const mappedLanguage = mapLanguageToKey(codeTestData.challenges[0].language);
      setSelectedLanguage(mappedLanguage);
    }
    
    // Set initial test input
    if (codeTestData.challenges[0]?.testcases[0]) {
      setInput(codeTestData.challenges[0].testcases[0].input);
    }
  }, []);

  // Map language from challenge to the key used in boilerplateCode
  const mapLanguageToKey = (language: string): string => {
    const mapping: Record<string, string> = {
      'javascript': 'nodejs',
      'python3': 'python',
      // Add more mappings if needed
    };
    return mapping[language] || language;
  };

  // Update language if challenge changes
  useEffect(() => {
    if (activeChallenge) {
      const mappedLanguage = mapLanguageToKey(activeChallenge.language);
      setSelectedLanguage(mappedLanguage);
    }
  }, [activeIndex, activeChallenge]);

  const getCodeKey = () => `${activeIndex}-${selectedLanguage}`;
  
  const updateCode = (code: string) => {
    const key = getCodeKey();
    setCodeStore(prev => ({...prev, [key]: code}));
  };

  const getLanguageConfig = (lang: string) => {
    return languages.find(l => l.value === lang) || languages[0];
  };

  const runCode = async () => {
    setIsExecuting(true);
    setOutput('Executing...');
    
    try {
      const langConfig = getLanguageConfig(selectedLanguage);
      const code = codeStore[getCodeKey()] || '';
      
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.value,
          version: langConfig.version,
          files: [{ 
            name: langConfig.file, 
            content: code 
          }],
          stdin: input,
        }),
      });
      
      const data = await res.json();
      setOutput(data.run?.output || data.run?.stderr || data.message || 'No output');
    } catch (error) {
      setOutput('Error executing code: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeChallenge) return;
    
    setIsExecuting(true);
    setTestResults([]);
    
    try {
      const langConfig = getLanguageConfig(selectedLanguage);
      const code = codeStore[getCodeKey()] || '';
      
      const results = await Promise.all(
        activeChallenge.testcases.map(async (test) => {
          try {
            const res = await fetch('https://emkc.org/api/v2/piston/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: langConfig.value,
                version: langConfig.version,
                files: [{ 
                  name: langConfig.file, 
                  content: code 
                }],
                stdin: test.input,
              }),
            });
            
            const data = await res.json();
            const output = data.run?.output || data.run?.stderr || '';
            
            // Trim whitespace and newlines for comparison
            const cleanOutput = output.trim();
            const cleanExpected = test.expectedOutput.trim();
            
            return {
              passed: cleanOutput === cleanExpected,
              input: test.input,
              expected: cleanExpected,
              output: cleanOutput,
            };
          } catch (error) {
            return {
              passed: false,
              input: test.input,
              expected: test.expectedOutput,
              output: 'Error executing test: ' + (error instanceof Error ? error.message : String(error)),
            };
          }
        })
      );
      
      setTestResults(results);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="h-screen grid grid-cols-[200px_1fr]">
      {/* Compact sidebar with challenges */}
      <aside className="border-r h-full bg-muted flex flex-col">
        <div className="p-3 border-b">
          <h1 className="font-bold text-sm">{codeTestData.testTitle}</h1>
          <p className="text-xs text-muted-foreground">{codeTestData.testDescription}</p>
        </div>
        <div className="p-2">
          <h2 className="font-bold text-xs mb-1">Challenges</h2>
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-1 space-y-0.5">
            {codeTestData.challenges.map((challenge, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`p-2 rounded-md cursor-pointer hover:bg-primary/10 transition-colors text-xs ${
                  idx === activeIndex ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <h3 className="font-medium truncate">{challenge.title}</h3>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main content area */}
      <main className="flex flex-col h-full">
        <div className="flex justify-end items-center p-2 border-b">
          <div className="flex items-center gap-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="font-mono text-red-600 text-sm">Time left: {formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="grid grid-cols-[3fr_2fr] gap-2 p-2 flex-grow overflow-hidden">
          {/* Code editor area */}
          <Card className="flex-grow overflow-hidden">
            <Editor
              theme="vs-dark"
              language={selectedLanguage === 'nodejs' ? 'javascript' : selectedLanguage}
              value={codeStore[getCodeKey()] || ''}
              onChange={(value) => updateCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </Card>
          
          {/* Tabs for Problem, Test, Submit */}
          <Tabs defaultValue="problem" className="flex flex-col h-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="submit">Submit</TabsTrigger>
            </TabsList>
            
            {/* Problem Description Tab */}
            <TabsContent value="problem" className="flex-grow overflow-auto">
              <Card className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-2">{activeChallenge?.title}</h2>
                <div className="prose max-w-none mb-4 text-sm">
                  <p>{activeChallenge?.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm mb-2">Test Cases:</h3>
                  <Accordion type="multiple" className="w-full">
                    {activeChallenge?.testcases.map((testCase, idx) => (
                      !testCase.hidden ? (
                        <AccordionItem value={`testcase-${idx}`} key={idx} className="border rounded-md mb-2">
                          <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Eye size={16} className="text-muted-foreground" />
                              <span>Test Case {idx + 1}</span>
                              {testCase.description && <span className="text-xs text-muted-foreground">({testCase.description})</span>}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="font-medium mb-1">Input:</div>
                                <pre className="bg-muted p-2 rounded text-xs">{testCase.input}</pre>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Expected Output:</div>
                                <pre className="bg-muted p-2 rounded text-xs">{testCase.expectedOutput}</pre>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ) : (
                        <div key={idx} className="flex items-center gap-2 p-3 text-sm border rounded-md mb-2 text-muted-foreground">
                          <EyeOff size={16} />
                          <span>Hidden Test Case {idx + 1}</span>
                        </div>
                      )
                    ))}
                  </Accordion>
                </div>
              </Card>
            </TabsContent>
            
            {/* Test Tab */}
            <TabsContent value="test" className="flex-grow overflow-auto">
              <Card className="p-3 h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="font-medium text-sm mb-1">Input:</h3>
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter test input here..."
                    className="text-xs resize-none h-20"
                  />
                </div>
                
                <div className="flex-grow overflow-auto">
                  <h3 className="font-medium text-sm mb-1">Output:</h3>
                  <div className="bg-muted rounded-md p-3 h-full whitespace-pre-wrap text-xs font-mono">
                    {output || 'Run your code to see output'}
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button onClick={runCode} disabled={isExecuting} size="sm">
                    {isExecuting ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            {/* Submit Tab */}
            <TabsContent value="submit" className="flex-grow overflow-auto">
              <Card className="p-3 h-full flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold">Submit Solution</h2>
                  <Button onClick={handleSubmit} variant="default" disabled={isExecuting} size="sm">
                    {isExecuting ? 'Running Tests...' : 'Run All Tests'}
                  </Button>
                </div>
                
                <div className="flex-grow overflow-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Submit your solution to see test results
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-muted p-3 rounded-md">
                        <h3 className="font-medium text-sm mb-2">Test Results Summary</h3>
                        <div className="flex gap-2">
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Passed: {testResults.filter(r => r.passed).length}
                          </div>
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            Failed: {testResults.filter(r => !r.passed).length}
                          </div>
                        </div>
                      </div>
                      
                      <Accordion type="multiple" className="w-full">
                        {testResults.map((result, idx) => (
                          <AccordionItem 
                            value={`result-${idx}`} 
                            key={idx}
                            className={`border rounded-md mb-2 ${
                              result.passed ? 'border-green-200' : 'border-red-200'
                            }`}
                          >
                            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                              <div className="flex items-center gap-2">
                                {result.passed ? 
                                  <CheckCircle size={16} className="text-green-600" /> : 
                                  <XCircle size={16} className="text-red-600" />
                                }
                                <span>Test Case {idx + 1}</span>
                                <span 
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {result.passed ? 'PASSED' : 'FAILED'}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">Input:</span>
                                  <pre className="mt-1 bg-muted p-2 rounded">{result.input}</pre>
                                </div>
                                <div>
                                  <span className="font-medium">Expected:</span>
                                  <pre className="mt-1 bg-muted p-2 rounded">{result.expected}</pre>
                                </div>
                                <div>
                                  <span className="font-medium">Your Output:</span>
                                  <pre className={`mt-1 p-2 rounded ${
                                    result.passed ? 'bg-muted' : 'bg-red-50'
                                  }`}>{result.output}</pre>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}