"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/connectDatabase";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import your type definitions
import { CodeTest, Challenge, TestCase } from "@/form_schemas/challengeSchema"; // Adjust path as needed

interface FormData extends Omit<CodeTest, "challenges"> {
  challenges: (Challenge & { testcases: TestCase[] })[];
}

export default function EditCodeTest() {
  // Use searchParams instead of params to get query parameters
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    testTitle: "",
    testDescription: "",
    testDuration: 0,
    challenges: [],
  });

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setError("Test ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const testRef = doc(db, "challenges", testId);
        const testDoc = await getDoc(testRef);
        
        if (testDoc.exists()) {
          const testData = testDoc.data() as CodeTest & { challenges?: Challenge[] };
          console.log("Fetched test data:", testData);
          setFormData({
            testTitle: testData.testTitle || "",
            testDescription: testData.testDescription || "",
            testDuration: testData.testDuration || 0,
            challenges: testData.challenges?.map(challenge => ({
              ...challenge,
              testcases: challenge.testcases || []
            })) || [],
          });
        } else {
          setError("Test not found");
        }
      } catch (err) {
        console.error("Error fetching test:", err);
        setError(`Error fetching test: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  // Update test data
  const handleSave = async () => {
    if (!testId) {
      setError("Test ID is missing");
      return;
    }

    try {
      setLoading(true);
      
      // Basic validation
      if (!formData.testTitle) {
        setError("Test title is required");
        setLoading(false);
        return;
      }
      
      if (!formData.challenges.length) {
        setError("At least one challenge is required");
        setLoading(false);
        return;
      }
      
      // Check each challenge has required fields
      for (const challenge of formData.challenges) {
        if (!challenge.title || !challenge.description || challenge.score === undefined) {
          setError("All challenges must have a title, description, and score");
          setLoading(false);
          return;
        }
        
        if (!challenge.testcases || challenge.testcases.length === 0) {
          setError("All challenges must have at least one test case");
          setLoading(false);
          return;
        }
        
        // Check each test case has required fields
        for (const testcase of challenge.testcases) {
          if (testcase.input === undefined || testcase.expectedOutput === undefined ||
              testcase.description === undefined || testcase.hidden === undefined) {
            setError("All test cases must have input, expected output, description, and hidden status");
            setLoading(false);
            return;
          }
        }
      }
      
      const testRef = doc(db, "challenges", testId);
      
      // Update with new data and updated timestamp
      await updateDoc(testRef, {
        ...formData,
        updatedAt: Timestamp.now()
      });
      
      // Redirect back
      router.push("/dashboard/challenges");
      
    } catch (err) {
      console.error("Error updating test:", err);
      setError(`Error updating test: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  // Form field handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "testDuration" ? Number(value) : value
    }));
  };

  // Challenge handlers
  const addChallenge = () => {
    setFormData(prev => ({
      ...prev,
      challenges: [...prev.challenges, {
        title: "",
        description: "",
        score: 10,
        testcases: []
      }]
    }));
  };

  const updateChallenge = (index: number, field: keyof Challenge, value: string | number) => {
    setFormData(prev => {
      const updatedChallenges = [...prev.challenges];
      updatedChallenges[index] = {
        ...updatedChallenges[index],
        [field]: field === "score" ? Number(value) : value
      };
      return { ...prev, challenges: updatedChallenges };
    });
  };

  const removeChallenge = (index: number) => {
    setFormData(prev => {
      const updatedChallenges = [...prev.challenges];
      updatedChallenges.splice(index, 1);
      return { ...prev, challenges: updatedChallenges };
    });
  };

  // Test case handlers
  const addTestCase = (challengeIndex: number) => {
    setFormData(prev => {
      const updatedChallenges = [...prev.challenges];
      if (!updatedChallenges[challengeIndex].testcases) {
        updatedChallenges[challengeIndex].testcases = [];
      }
      updatedChallenges[challengeIndex].testcases.push({
        input: "",
        expectedOutput: "",
        description: "",
        hidden: false
      });
      return { ...prev, challenges: updatedChallenges };
    });
  };

  const updateTestCase = (
    challengeIndex: number, 
    testCaseIndex: number, 
    field: keyof TestCase, 
    value: string | boolean
  ) => {
    setFormData(prev => {
      const updatedChallenges = [...prev.challenges];
      updatedChallenges[challengeIndex].testcases[testCaseIndex] = {
        ...updatedChallenges[challengeIndex].testcases[testCaseIndex],
        [field]: value
      };
      return { ...prev, challenges: updatedChallenges };
    });
  };

  const removeTestCase = (challengeIndex: number, testCaseIndex: number) => {
    setFormData(prev => {
      const updatedChallenges = [...prev.challenges];
      updatedChallenges[challengeIndex].testcases.splice(testCaseIndex, 1);
      return { ...prev, challenges: updatedChallenges };
    });
  };

  if (loading && !formData.testTitle) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg mb-2">Loading test data...</div>
              {!testId && <div className="text-sm text-red-500">No test ID found in URL</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Code Test</CardTitle>
          <CardDescription>Update an existing coding assessment</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            {/* Basic test information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="testTitle">Test Title</Label>
                <Input
                  id="testTitle"
                  name="testTitle"
                  value={formData.testTitle}
                  onChange={handleInputChange}
                  maxLength={100}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="testDescription">Test Description</Label>
                <Textarea
                  id="testDescription"
                  name="testDescription"
                  value={formData.testDescription}
                  onChange={handleInputChange}
                  maxLength={500}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="testDuration">Test Duration (minutes)</Label>
                <Input
                  id="testDuration"
                  name="testDuration"
                  type="number"
                  min={1}
                  value={formData.testDuration}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Challenges */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Challenges</h3>
                <Button 
                  onClick={addChallenge} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Challenge
                </Button>
              </div>
              
              {formData.challenges.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No challenges added yet. Add your first challenge.
                </div>
              ) : (
                <div className="space-y-8">
                  {formData.challenges.map((challenge, challengeIndex) => (
                    <Card key={challengeIndex} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-md">Challenge {challengeIndex + 1}</CardTitle>
                          </div>
                          <Button 
                            onClick={() => removeChallenge(challengeIndex)} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`challenge-${challengeIndex}-title`}>Challenge Title</Label>
                          <Input
                            id={`challenge-${challengeIndex}-title`}
                            value={challenge.title}
                            onChange={(e) => updateChallenge(challengeIndex, "title", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`challenge-${challengeIndex}-description`}>Description</Label>
                          <Textarea
                            id={`challenge-${challengeIndex}-description`}
                            value={challenge.description}
                            onChange={(e) => updateChallenge(challengeIndex, "description", e.target.value)}
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`challenge-${challengeIndex}-score`}>Score</Label>
                          <Input
                            id={`challenge-${challengeIndex}-score`}
                            type="number"
                            min={1}
                            value={challenge.score}
                            onChange={(e) => updateChallenge(challengeIndex, "score", Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        
                        {/* Test Cases */}
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-2">
                            <Label>Test Cases</Label>
                            <Button 
                              onClick={() => addTestCase(challengeIndex)} 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Add Test Case
                            </Button>
                          </div>
                          
                          {!challenge.testcases || challenge.testcases.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No test cases added. Add at least one test case.
                            </div>
                          ) : (
                            <Tabs defaultValue="0" className="w-full">
                              <TabsList className="mb-4 flex overflow-x-auto">
                                {challenge.testcases.map((_, testCaseIndex) => (
                                  <TabsTrigger 
                                    key={testCaseIndex} 
                                    value={testCaseIndex.toString()}
                                    className="text-xs"
                                  >
                                    Test {testCaseIndex + 1}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                              
                              {challenge.testcases.map((testCase, testCaseIndex) => (
                                <TabsContent 
                                  key={testCaseIndex}
                                  value={testCaseIndex.toString()}
                                  className="border rounded-md p-4 pt-0 relative"
                                >
                                  <Button 
                                    onClick={() => removeTestCase(challengeIndex, testCaseIndex)} 
                                    variant="ghost" 
                                    size="sm"
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                  
                                  <div className="space-y-4 pt-8">
                                    <div>
                                      <Label htmlFor={`testcase-${challengeIndex}-${testCaseIndex}-description`}>
                                        Description
                                      </Label>
                                      <Input
                                        id={`testcase-${challengeIndex}-${testCaseIndex}-description`}
                                        value={testCase.description}
                                        onChange={(e) => updateTestCase(
                                          challengeIndex, 
                                          testCaseIndex, 
                                          "description", 
                                          e.target.value
                                        )}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`testcase-${challengeIndex}-${testCaseIndex}-input`}>
                                        Input
                                      </Label>
                                      <Textarea
                                        id={`testcase-${challengeIndex}-${testCaseIndex}-input`}
                                        value={testCase.input}
                                        onChange={(e) => updateTestCase(
                                          challengeIndex, 
                                          testCaseIndex, 
                                          "input", 
                                          e.target.value
                                        )}
                                        className="mt-1 font-mono text-sm"
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`testcase-${challengeIndex}-${testCaseIndex}-expectedOutput`}>
                                        Expected Output
                                      </Label>
                                      <Textarea
                                        id={`testcase-${challengeIndex}-${testCaseIndex}-expectedOutput`}
                                        value={testCase.expectedOutput}
                                        onChange={(e) => updateTestCase(
                                          challengeIndex, 
                                          testCaseIndex, 
                                          "expectedOutput", 
                                          e.target.value
                                        )}
                                        className="mt-1 font-mono text-sm"
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id={`testcase-${challengeIndex}-${testCaseIndex}-hidden`}
                                        checked={testCase.hidden}
                                        onCheckedChange={(checked) => updateTestCase(
                                          challengeIndex, 
                                          testCaseIndex, 
                                          "hidden", 
                                          checked
                                        )}
                                      />
                                      <Label htmlFor={`testcase-${challengeIndex}-${testCaseIndex}-hidden`}>
                                        Hidden test case
                                      </Label>
                                    </div>
                                  </div>
                                </TabsContent>
                              ))}
                            </Tabs>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard/challenges")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}