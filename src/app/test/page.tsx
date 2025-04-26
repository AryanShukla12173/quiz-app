"use client"
import React from 'react'
import { useEffect, useState } from 'react'
import { db } from '@/lib/connectDatabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { doc, getDoc, addDoc, collection, Timestamp } from '@firebase/firestore'
import { ChallengesDocumentData, SubmissionResult, LANGUAGES, EDITOR_OPTIONS } from '@/lib/types'
import Editor, { useMonaco } from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { TabsTrigger } from '@radix-ui/react-tabs'
import { executeCode } from '@/lib/piston-api'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useCurrentUserId } from '@/hooks/useGetCurrentUserId'
function TestComponent() {
    const searchParams = useSearchParams()
    const testId = searchParams.get('testId')
    const [challengeData, setChallengeData] = useState<ChallengesDocumentData | null>(null)
    const [resultData, setResultData] = useState<SubmissionResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0])
    const [codeByChallenge, setCodeByChallenge] = useState<Record<string, string>>({})
    const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null)
    const [output, setOutput] = useState<string>("")
    const [input, setInput] = useState<string>("")
    const [testResults, setTestResults] = useState<Record<string, Record<number, { passed: boolean, output: string, error: string }>>>({})
    const [runningTests, setRunningTests] = useState(false)
    const [submissionSuccessful, setSubmissionSuccessful] = useState(false)
    const router =  useRouter()
    const TabItems = [
        { name: "Description", id: 'desc-tab' },
        { name: 'Test', id: 'test-tab' },
        { name: "Test Cases", id: 'test-cases-tab' },
    ]
    const userId = useCurrentUserId()
    // Modified to include localStorage persistence
    const handleCodeChange = (challengeId: string, newCode: string | undefined) => {
        if (!challengeId || !newCode) return;
        
        // Update state
        setCodeByChallenge((prev) => ({
          ...prev,
          [challengeId]: newCode,
        }));
        
        // Save to localStorage
        try {
            // Create a storage key that includes the test ID to separate code for different tests
            const storageKey = `code_${testId}_${challengeId}`;
            localStorage.setItem(storageKey, newCode);
        } catch (e) {
            console.error("Failed to save code to localStorage:", e);
        }
    };
      
    async function fetchChallengeById() {
        try {
            if (testId) {
                setLoading(true)
                const challengeRef = doc(db, 'challenges', testId.trim())
                const challengeSnap = await getDoc(challengeRef)
                if (challengeSnap.exists()) {
                    const challengeData = challengeSnap.data() as ChallengesDocumentData;
                    console.log(challengeData);
                    setChallengeData(challengeData);
                    
                    // Load saved code for all challenges from localStorage
                    const savedCodeByChallenge: Record<string, string> = {};
                    challengeData.challenges.forEach((challenge, index) => {
                        const challengeId = `challenge_${index}`;
                        const storageKey = `code_${testId}_${challengeId}`;
                        
                        try {
                            const savedCode = localStorage.getItem(storageKey);
                            if (savedCode) {
                                savedCodeByChallenge[challengeId] = savedCode;
                            }
                        } catch (e) {
                            console.error("Failed to load code from localStorage:", e);
                        }
                    });
                    
                    setCodeByChallenge(savedCodeByChallenge);
                    
                    // Set initial selected challenge
                    setSelectedChallenge(0);
                    setSelectedChallengeId(`challenge_0`);
                    
                    setLoading(false);
                } else {
                    console.log("No such document!")
                    setLoading(false)
                }
            }
            return
        } catch (error) {
            console.error("Error fetching challenge:", error)
            setError("An error occurred while fetching the challenge data")
            return
        }
    }

    useEffect(() => {
        fetchChallengeById()
    }, [testId])

    const handleChallengeSelect = (index: number) => {
        setSelectedChallenge(index);
        const challengeId = `challenge_${index}`;
        setSelectedChallengeId(challengeId);
        
        // Load saved code from localStorage if it exists
        if (testId) {
            const storageKey = `code_${testId}_${challengeId}`;
            try {
                const savedCode = localStorage.getItem(storageKey);
                if (savedCode && !codeByChallenge[challengeId]) {
                    setCodeByChallenge(prev => ({
                        ...prev,
                        [challengeId]: savedCode
                    }));
                }
            } catch (e) {
                console.error("Failed to load code from localStorage:", e);
            }
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLang = LANGUAGES.find(lang => lang.value === e.target.value)
        if (selectedLang) {
            setSelectedLanguage(selectedLang)
        }
    }
    
    async function handleRunTest() {
        try {
            const resultData = await executeCode(codeByChallenge[selectedChallengeId || ""] || "", selectedLanguage.value, input)
            console.log("Execution result:", resultData)
            if (resultData.exitCode === 0) {    
                setOutput(resultData.output)
            }
            else {
                setOutput(resultData.error)
            }
            return 
        } catch (error) {
            console.error("Error running test:", error)
            setError("An error occurred while running the test")
            return
        }
    }

    async function handleRunAllTests() {
        if (!selectedChallengeId || !challengeData) return;
        
        setRunningTests(true);
        setError(null);
        
        const challengeIndex = selectedChallenge !== null ? selectedChallenge : 0;
        const code = codeByChallenge[selectedChallengeId] || "";
        const testcases = challengeData?.challenges[challengeIndex].testcases || [];
        
        const newResults: Record<number, { passed: boolean, output: string, error: string }> = {};
        
        for (let i = 0; i < testcases.length; i++) {
            const testcase = testcases[i];
            try {
                const result = await executeCode(code, selectedLanguage.value, testcase.input);
                
                // Check if output matches expected (trim whitespace for better comparison)
                const passed = result.output.trim() === testcase.expectedOutput.trim();
                
                newResults[i] = {
                    passed,
                    output: result.output,
                    error: result.error
                };
            } catch (error) {
                console.error(`Error running test case ${i}:`, error);
                newResults[i] = {
                    passed: false,
                    output: "",
                    error: error instanceof Error ? error.message : "Unknown error"
                };
            }
        }
        
        // Update test results for this challenge
        setTestResults(prev => ({
            ...prev,
            [selectedChallengeId]: newResults
        }));
        
        setRunningTests(false);
    }
    
    const allTestsPassed = (challengeId: string): boolean => {
        if (!testResults[challengeId]) return false;
        
        return Object.values(testResults[challengeId]).every(result => result.passed);
    };
    
    const getChallengeProgress = (): { completed: number, total: number } => {
        if (!challengeData) return { completed: 0, total: 0 };
        
        const total = challengeData.challenges.length;
        let completed = 0;
        
        challengeData.challenges.forEach((_, index) => {
            const challengeId = `challenge_${index}`;
            if (allTestsPassed(challengeId)) {
                completed++;
            }
        });
        
        return { completed, total };
    };
    
    const calculateEarnedPoints = (): number => {
        if (!challengeData) return 0;
        
        let earnedPoints = 0;
        
        challengeData.challenges.forEach((challenge, index) => {
            const challengeId = `challenge_${index}`;
            if (allTestsPassed(challengeId)) {
                earnedPoints += challenge.score;
            }
        });
        
        return earnedPoints;
    };
    
    const calculateTotalPoints = (): number => {
        if (!challengeData) return 0;
        
        return challengeData.challenges.reduce((total, challenge) => total + challenge.score, 0);
    };
    
    async function handleSubmitAllSolutions() {
        if (!challengeData || !testId) {
            setError("Missing challenge data or test ID");
            return;
        }
        
        try {
            setLoading(true);
            
            // First make sure all tests are run
            for (let i = 0; i < challengeData.challenges.length; i++) {
                const challengeId = `challenge_${i}`;
                if (!testResults[challengeId]) {
                    // If we haven't run tests for this challenge yet, select it and run its tests
                    setSelectedChallenge(i);
                    setSelectedChallengeId(challengeId);
                    await handleRunAllTests();
                }
            }
            
            const earnedPoints = calculateEarnedPoints();
            const totalPoints = calculateTotalPoints();
            
            // Create submission result document
            const submissionResult: Omit<SubmissionResult, 'challenges'> & { challenges: any[] } = {
                userId: userId || "",
                createdAt: Timestamp.now(),
                earnedPoints,
                totalPoints, 
                testId,
                challenges: challengeData.challenges.map((challenge, index) => {
                    const challengeId = `challenge_${index}`;
                    const challengeResults = testResults[challengeId] || {};
                    
                    return {
                        title: challenge.title,
                        description: challenge.description,
                        testcases: challenge.testcases.map((testcase, testIndex) => {
                            const testResult = challengeResults[testIndex];
                            return {
                                description: testcase.description,
                                input: testcase.input,
                                expectedOutput: testcase.expectedOutput,
                                hidden: testcase.hidden,
                                passed: testResult?.passed || false,
                                actualOutput: testResult?.output || '',
                                error: testResult?.error || ''
                            };
                        })
                    };
                })
            };
            
            // Add the submission to Firestore
            const submissionRef = await addDoc(collection(db, 'codeTestsubmissions'), submissionResult);
            console.log("Submission created with ID:", submissionRef.id);
            
            // Set submission result in state
            setResultData(submissionResult as SubmissionResult);
            setSubmissionSuccessful(true);
            setLoading(false);
            router.replace('/analytics')
            
        } catch (error) {
            console.error("Error submitting solutions:", error);
            setError("An error occurred while submitting your solutions");
            setLoading(false);
        }
    }

    const currentChallenge = selectedChallenge !== null && challengeData?.challenges 
        ? challengeData.challenges[selectedChallenge] 
        : null;

    const { completed, total } = getChallengeProgress();

    return (
        <div className='w-screen h-screen flex flex-row'>
            <div className='w-1/4 h-screen bg-red-400 p-3 flex flex-col'>
                <div className="mb-4">
                    <p className="font-bold text-lg">
                        {challengeData ? challengeData.testTitle : loading ? "Loading..." : "Test Not Found"}
                    </p>
                    <p className="text-sm">
                        Progress: {completed}/{total} challenges completed
                    </p>
                    <div className="w-full bg-red-200 rounded-full h-2.5 mt-2">
                        <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
                
                <ul className="flex-grow overflow-auto">
                    {challengeData?.challenges.map((challenge, index) => {
                        const challengeId = `challenge_${index}`;
                        const isPassed = allTestsPassed(challengeId);
                        
                        return (
                            <li 
                                key={index}
                                className={`p-2 mb-2 rounded cursor-pointer flex items-center justify-between
                                    ${selectedChallenge === index ? 'bg-red-600 text-white' : 'hover:bg-red-300'}`}
                                onClick={() => handleChallengeSelect(index)}
                            >
                                <span>{challenge.title}</span>
                                {isPassed && <CheckCircle className="h-5 w-5 text-green-500" />}
                            </li>
                        );
                    })}
                </ul>
                
                <div className="mt-4">
                    <button
                        className="w-full bg-green-600 text-white p-2 rounded mb-2 flex items-center justify-center"
                        onClick={handleSubmitAllSolutions}
                        disabled={loading || runningTests}
                    >
                        {loading ? 'Submitting...' : 'Submit All Solutions'}
                    </button>
                    
                    {submissionSuccessful && (
                        <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded">
                            <p>Score: {resultData?.earnedPoints}/{resultData?.totalPoints}</p>
                            <p className="text-sm">Submission successful!</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
                            {error}
                        </div>
                    )}
                </div>
            </div>
            
            <div className='w-1/4 flex-2 h-screen bg-amber-400 flex flex-col'>
                <div className="p-3 bg-amber-500">
                    <div className="flex items-center mb-2">
                        <label htmlFor="language-select" className="mr-2 font-medium">Language:</label>
                        <select 
                            id="language-select"
                            value={selectedLanguage.value}
                            onChange={handleLanguageChange}
                            className="bg-amber-100 p-1 rounded border border-amber-700"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="flex-grow">
                    <Editor
                        value={selectedChallengeId ? (codeByChallenge[selectedChallengeId] || "") : ""}
                        onChange={(val) => selectedChallengeId && handleCodeChange(selectedChallengeId, val)}
                        height="100%"
                        language={selectedLanguage.monacoId}
                        theme="vs-dark"
                        options={EDITOR_OPTIONS}
                    />
                </div>
            </div>
            
            <Tabs defaultValue="Description" className="w-2/5 h-screen bg-blue-400 overflow-auto p-5">
                <TabsList className="w-full flex">
                    {TabItems.map((item) => (
                        <TabsTrigger key={item.id} value={item.name} className="flex-1 h-12">
                            {item.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                <TabsContent value="Description" className="p-4">
                    {currentChallenge ? (
                        <div>
                            <h2 className="text-xl font-bold mb-2">{currentChallenge.title}</h2>
                            <p className="mb-4">{currentChallenge.description}</p>
                            <p className="text-sm font-semibold">Points: {currentChallenge.score}</p>
                        </div>
                    ) : (
                        <p>Select a challenge to view details</p>
                    )}
                </TabsContent>
                
                <TabsContent value="Test" className="p-4">
                    {currentChallenge ? (
                        <div>
                            <h2 className="text-xl font-bold mb-2">{currentChallenge.title}</h2>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Test Your Code</h3>
                                <textarea 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-24 p-2 border border-gray-300 rounded"
                                    placeholder="Enter your input here..."
                                ></textarea>
                                <div className="mt-2">
                                    <h4 className="font-semibold">Output:</h4>
                                    <pre className="bg-gray-100 p-2 rounded">{output}</pre>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <button 
                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                        onClick={handleRunTest}
                                        disabled={runningTests}
                                    >
                                        Run Test
                                    </button>
                                    <button 
                                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                                        onClick={handleRunAllTests}
                                        disabled={runningTests}
                                    >
                                        {runningTests ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                                                Running...
                                            </>
                                        ) : 'Run All Tests'}
                                    </button>
                                </div>
                                
                                {selectedChallengeId && testResults[selectedChallengeId] && (
                                    <div className="mt-4">
                                        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                                        <div className="border border-gray-300 rounded p-2 bg-white">
                                            {allTestsPassed(selectedChallengeId) ? (
                                                <div className="bg-green-100 p-2 mb-2 rounded flex items-center">
                                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                                    <span>All tests passed! Challenge completed.</span>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-100 p-2 mb-2 rounded">
                                                    <span>Some tests failed. Check details below.</span>
                                                </div>
                                            )}
                                            
                                            {currentChallenge.testcases.map((testcase, i) => {
                                                const result = testResults[selectedChallengeId]?.[i];
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`mb-2 p-2 rounded ${
                                                            result?.passed ? 'bg-green-50' : 'bg-red-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            {result?.passed ? (
                                                                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                                                            )}
                                                            <span className="font-medium">{testcase.description}</span>
                                                        </div>
                                                        <div className="mt-1 text-sm">
                                                            <div><span className="font-medium">Input:</span> {testcase.input}</div>
                                                            <div><span className="font-medium">Expected:</span> {testcase.expectedOutput}</div>
                                                            {result && (
                                                                <div>
                                                                    <span className="font-medium">Your output:</span> {result.output || result.error}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p>Select a challenge to view details</p>
                    )}
                </TabsContent>
                
                <TabsContent value="Test Cases" className="p-4">
                    {currentChallenge ? (
                        <div>
                            <h2 className="text-xl font-bold mb-2">{currentChallenge.title}</h2>
                            <ul className="space-y-4">
                                {currentChallenge.testcases.map((testcase, index) => (
                                    <li key={index} className="bg-blue-300 p-3 rounded">
                                        <p className="font-semibold">{testcase.description}</p>
                                        <div className="mt-2">
                                            <p><span className="font-medium">Input:</span> {testcase.input}</p>
                                            <p><span className="font-medium">Expected Output:</span> {testcase.expectedOutput}</p>
                                            <p><span className="font-medium">Hidden:</span> {testcase.hidden ? "Yes" : "No"}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>Select a challenge to view details</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default TestComponent