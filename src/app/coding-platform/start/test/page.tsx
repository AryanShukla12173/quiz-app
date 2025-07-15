"use client"
import React, { Suspense } from 'react'
import { useEffect, useState } from 'react'
import {  db } from '@/lib/connectDatabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { doc, getDoc, addDoc, collection, Timestamp, query, where, getDocs } from '@firebase/firestore'
import { ChallengesDocumentData, SubmissionResult, LANGUAGES, EDITOR_OPTIONS } from '@/lib/types'
import Editor from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { TabsTrigger } from '@radix-ui/react-tabs'
import { executeCode } from '@/lib/piston-api'
import { CheckCircle, XCircle, Clock, AlarmClock } from 'lucide-react'
import { useCurrentUserId } from '@/hooks/useGetCurrentUserId'
// Client Component wrapper to handle search params
function TestComponentWrapper() {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <TestComponent />
      </Suspense>
    );
  }
  
  // Loading screen component
  function LoadingScreen() {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded shadow-md">
          <Clock className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading test data...</p>
        </div>
      </div>
    );
  }
  
function TestComponent() {
    const searchParams = useSearchParams()
    const router = useRouter()
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
    const [checkingPreviousSubmission, setCheckingPreviousSubmission] = useState(true)
    const [testProcessingProgress, setTestProcessingProgress] = useState({ current: 0, total: 0 })

    // Timer states
    const [testStartTime, setTestStartTime] = useState<Timestamp | null>(null)
    const [remainingTime, setRemainingTime] = useState<number | null>(null)
    const [timeIsUp, setTimeIsUp] = useState(false)

    const TabItems = [
        { name: "Description", id: 'desc-tab' },
        { name: 'Test', id: 'test-tab' },
        { name: "Test Cases", id: 'test-cases-tab' },
    ]

    const userId = useCurrentUserId()

    // Modified to still include localStorage for code persistence, but not for checking submission status
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

    // Check if user has already submitted this test
    async function checkPreviousSubmission() {
        if (!testId || !userId) {
            setCheckingPreviousSubmission(false);
            return;
        }

        try {
            const submissionsRef = collection(db, 'codeTestsubmissions');
            const q = query(submissionsRef,
                where('userId', '==', userId),
                where('testId', '==', testId)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // User has already submitted this test
                console.log("User already submitted this test, redirecting to analytics");
                router.push('/coding-platform/analytics');
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error checking previous submissions:", error);
            return false;
        } finally {
            setCheckingPreviousSubmission(false);
        }
    }

    async function fetchChallengeById() {
        try {
            if (testId) {
                setLoading(true)
                const challengeRef = doc(db, 'challenges', testId.trim())
                const challengeSnap = await getDoc(challengeRef)
                if (challengeSnap.exists()) {
                    const challengeData = challengeSnap.data() as ChallengesDocumentData;
                    setChallengeData(challengeData);

                    // Initialize the timer
                    initializeTimer(challengeData.testDuration);

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

    // Initialize timer function - modified to remove localStorage check for test submission
    const initializeTimer = (durationInMinutes: number) => {
        // Check if we have a stored start time
        const storedStartTime = localStorage.getItem(`test_start_${testId}`);
        let startTime: Timestamp;

        if (storedStartTime) {
            // Use stored start time
            startTime = Timestamp.fromMillis(parseInt(storedStartTime));
        } else {
            // Create new start time
            startTime = Timestamp.now();
            localStorage.setItem(`test_start_${testId}`, startTime.toMillis().toString());
        }

        setTestStartTime(startTime);

        // Calculate remaining time in seconds
        const endTimeMillis = startTime.toMillis() + (durationInMinutes * 60 * 1000);
        const currentTimeMillis = new Date().getTime();
        const remainingMillis = Math.max(0, endTimeMillis - currentTimeMillis);
        setRemainingTime(Math.floor(remainingMillis / 1000));

        // If time is already up, auto-submit
        if (remainingMillis <= 0) {
            setTimeIsUp(true);
            handleSubmitAllSolutions();
        }
    };

    // Timer update effect
    useEffect(() => {
        if (remainingTime === null || timeIsUp) return;

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeIsUp(true);
                    handleSubmitAllSolutions();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime, timeIsUp]);

    useEffect(() => {
        const init = async () => {
            // First check if user already submitted this test
            const hasSubmitted = await checkPreviousSubmission();
            if (!hasSubmitted) {
                // If not, proceed with fetching challenge data
                await fetchChallengeById();
            }
        };

        init();
    }, [testId, userId]);

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

    // Helper function to add delay between API calls
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
                // Add a delay between API calls to prevent rate limiting
                if (i > 0) await delay(1000);

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

    const countAttemptedChallenges = (): number => {
        if (!challengeData) return 0;

        return Object.keys(codeByChallenge).length;
    };

    // Modified to run tests with rate limiting before final submission
    async function handleSubmitAllSolutions() {
        if (!challengeData || !testId || !testStartTime) {
            setError("Missing challenge data, test ID, or start time");
            return;
        }

        try {
            setLoading(true);
            setRunningTests(true);

            // First make sure all tests are run with rate limiting
            const totalChallenges = challengeData.challenges.length;
            setTestProcessingProgress({ current: 0, total: totalChallenges });

            // Process each challenge that has code
            for (let i = 0; i < totalChallenges; i++) {
                const challengeId = `challenge_${i}`;
                setTestProcessingProgress(prev => ({ ...prev, current: i }));

                if (codeByChallenge[challengeId]) {
                    // Select the challenge
                    setSelectedChallenge(i);
                    setSelectedChallengeId(challengeId);

                    // Run tests for this challenge with rate limiting
                    const code = codeByChallenge[challengeId];
                    const challenge = challengeData.challenges[i];
                    const testcases = challenge.testcases;

                    const challengeResults: Record<number, { passed: boolean, output: string, error: string }> = {};

                    for (let j = 0; j < testcases.length; j++) {
                        const testcase = testcases[j];

                        try {
                            // Add delay between API calls to respect rate limits
                            if (i > 0 || j > 0) {
                                await delay(1000); // 1 second delay between API calls
                            }

                            const result = await executeCode(code, selectedLanguage.value, testcase.input);

                            // Check if output matches expected
                            const passed = result.output.trim() === testcase.expectedOutput.trim();

                            challengeResults[j] = {
                                passed,
                                output: result.output,
                                error: result.error
                            };
                        } catch (error) {
                            console.error(`Error running test case ${j} for challenge ${i}:`, error);
                            challengeResults[j] = {
                                passed: false,
                                output: "",
                                error: error instanceof Error ? error.message : "Unknown error"
                            };
                        }
                    }

                    // Update test results for this challenge
                    setTestResults(prev => ({
                        ...prev,
                        [challengeId]: challengeResults
                    }));
                }
            }

            setRunningTests(false);

            // Now proceed with submission
            const earnedPoints = calculateEarnedPoints();
            const totalPoints = calculateTotalPoints();
            const noOfChallengesAttempted = countAttemptedChallenges();

            // Create submission result document that matches the SubmissionResult type
            const submissionResult: SubmissionResult = {
                userId: userId || "",
                createdAt: Timestamp.now(),
                earnedPoints,
                totalPoints,
                testId,
                testTitle: challengeData.testTitle,
                testDescription: challengeData.testDescription,
                testDuration: challengeData.testDuration,
                testStartTime: testStartTime,
                testEndTime: Timestamp.now(),
                noOfChallengesAttempted,
                challenges: challengeData.challenges.map((challenge, index) => {
                    const challengeId = `challenge_${index}`;
                    const attempted = !!codeByChallenge[challengeId];

                    return {
                        title: challenge.title,
                        description: challenge.description,
                        attempted,
                        testcases: challenge.testcases.map((testcase) => {
                            
                            return {
                                description: testcase.description,
                                input: testcase.input,
                                expectedOutput: testcase.expectedOutput,
                                hidden: testcase.hidden
                            };
                        })
                    };
                })
            };

            // Add the submission to Firestore
            const submissionRef = await addDoc(collection(db, 'codeTestsubmissions'), submissionResult);
            console.log("Submission created with ID:", submissionRef.id);

            // Clear localStorage test start time
            localStorage.removeItem(`test_start_${testId}`);

            // Set submission result in state
            setResultData(submissionResult);
            setSubmissionSuccessful(true);
            setLoading(false);

            // Redirect to results page
            router.push(`/coding-platform/analytics`);

        } catch (error) {
            console.error("Error submitting solutions:", error);
            setError("An error occurred while submitting your solutions");
            setLoading(false);
            setRunningTests(false);
        }
    }

    // Format remaining time as MM:SS
    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return "--:--";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const currentChallenge = selectedChallenge !== null && challengeData?.challenges
        ? challengeData.challenges[selectedChallenge]
        : null;

    const { completed, total } = getChallengeProgress();

    // Show loading indicator while checking previous submission
    if (checkingPreviousSubmission) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center p-8 bg-white rounded shadow-md">
                    <Clock className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                    <p className="text-lg font-medium">Checking previous submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-screen h-screen flex flex-row'>
            <div className='w-1/4 h-screen bg-red-400 p-3 flex flex-col'>
                <div className="mb-4">
                    <p className="font-bold text-lg">
                        {challengeData ? challengeData.testTitle : loading ? "Loading..." : "Test Not Found"}
                    </p>

                    {/* Timer display */}
                    <div className={`flex items-center mt-2 mb-3 p-2 rounded ${remainingTime && remainingTime < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        <AlarmClock className="h-5 w-5 mr-2" />
                        <div>
                            <p className="font-bold">{formatTime(remainingTime)}</p>
                            <p className="text-xs">{timeIsUp ? 'Time is up!' : 'Remaining'}</p>
                        </div>
                    </div>

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
                        const isAttempted = !!codeByChallenge[challengeId];

                        return (
                            <li
                                key={index}
                                className={`p-2 mb-2 rounded cursor-pointer flex items-center justify-between
                                    ${selectedChallenge === index ? 'bg-red-600 text-white' :
                                        isPassed ? 'bg-green-100' :
                                            isAttempted ? 'bg-yellow-100' : 'hover:bg-red-300'}`}
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
                        {runningTests && testProcessingProgress.total > 0 ? (
                            <>
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                                Processing {testProcessingProgress.current + 1}/{testProcessingProgress.total}
                            </>
                        ) : loading ? (
                            'Submitting...'
                        ) : (
                            'Submit'
                        )}
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
                                    <pre className="bg-gray-100 p-2 rounded text-black">{output}</pre>
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
                                        <div className="border border-gray-300 rounded p-2 bg-white text-black">
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
                                                        className={`mb-2 p-2 rounded ${result?.passed ? 'bg-green-50' : 'bg-red-50'
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

export default TestComponentWrapper