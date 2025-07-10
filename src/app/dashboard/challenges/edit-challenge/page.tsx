"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/connectDatabase";
import { CodeTest, Challenge, TestCase } from "@/form_schemas/challengeSchema";
import { AlertCircle, Plus, Trash } from "lucide-react";

interface FormData extends Omit<CodeTest, "challenges"> {
  challenges: (Challenge & { testcases: TestCase[] })[];
}

export default function EditCodeTest() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    testTitle: "",
    testDescription: "",
    testDuration: 0,
    challenges: [],
  });

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return setError("Missing test ID"), setLoading(false);
      try {
        const ref = doc(db, "challenges", testId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return setError("Test not found"), setLoading(false);
        const data = snap.data() as CodeTest & { challenges?: Challenge[] };
        setFormData({
          testTitle: data.testTitle || "",
          testDescription: data.testDescription || "",
          testDuration: data.testDuration || 0,
          challenges: data.challenges?.map(c => ({
            ...c,
            testcases: c.testcases || []
          })) || [],
        });
      } catch (err) {
        setError("Failed to fetch test");
        console.log(err)
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleSave = async () => {
    if (!testId) return setError("Missing test ID");

    try {
      if (!formData.testTitle) return setError("Title is required");
      if (!formData.challenges.length) return setError("At least one challenge is required");
      for (const challenge of formData.challenges) {
        if (!challenge.title || !challenge.description || challenge.score == null) {
          return setError("Each challenge needs title, description, and score");
        }
        if (!challenge.testcases.length) return setError("Each challenge must have at least one test case");
        for (const tc of challenge.testcases) {
          if (
            tc.input == null ||
            tc.expectedOutput == null ||
            tc.description == null ||
            tc.hidden == null
          ) {
            return setError("Each test case needs input, output, description, and hidden flag");
          }
        }
      }

      const ref = doc(db, "challenges", testId);
      await updateDoc(ref, { ...formData, updatedAt: Timestamp.now() });
      router.push("/dashboard/challenges");
    } catch (err) {
      console.error(err);
      setError("Failed to update test");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "testDuration" ? Number(value) : value,
    }));
  };

  const addChallenge = () => {
    setFormData(prev => ({
      ...prev,
      challenges: [
        ...prev.challenges,
        { title: "", description: "", score: 10, testcases: [] },
      ],
    }));
  };

  const updateChallenge = (index: number, field: keyof Challenge, value: string | number) => {
    const updated = [...formData.challenges];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, challenges: updated }));
  };

  const removeChallenge = (index: number) => {
    const updated = [...formData.challenges];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, challenges: updated }));
  };

  const addTestCase = (ci: number) => {
    const updated = [...formData.challenges];
    updated[ci].testcases.push({
      input: "",
      expectedOutput: "",
      description: "",
      hidden: false,
    });
    setFormData(prev => ({ ...prev, challenges: updated }));
  };

 const updateTestCase = (
  ci: number,
  ti: number,
  field: keyof TestCase,
  value: string | boolean
) => {
  const updated = [...formData.challenges];
  updated[ci].testcases[ti] = {
    ...updated[ci].testcases[ti],
    [field]: value,
  };
  setFormData(prev => ({ ...prev, challenges: updated }));
};

  const removeTestCase = (ci: number, ti: number) => {
    const updated = [...formData.challenges];
    updated[ci].testcases.splice(ti, 1);
    setFormData(prev => ({ ...prev, challenges: updated }));
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="card shadow bg-base-100 p-8 text-center">
          <p className="text-lg font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="card shadow bg-base-100">
        <div className="card-body space-y-6">
          <h2 className="card-title text-2xl">Edit Code Test</h2>
          <p className="text-sm text-base-content/60">Update coding test content and structure</p>

          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="testTitle">
                <span className="label-text">Test Title</span>
              </label>
              <input
                name="testTitle"
                value={formData.testTitle}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label" htmlFor="testDescription">
                <span className="label-text">Test Description</span>
              </label>
              <textarea
                name="testDescription"
                value={formData.testDescription}
                onChange={handleChange}
                rows={3}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div>
              <label className="label" htmlFor="testDuration">
                <span className="label-text">Test Duration (minutes)</span>
              </label>
              <input
                name="testDuration"
                type="number"
                min={1}
                value={formData.testDuration}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="divider" />

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Challenges</h3>
            <button onClick={addChallenge} className="btn btn-outline btn-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Challenge
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-4 px-1">
            {formData.challenges.map((challenge, i) => (
              <div
                key={i}
                className="card border border-base-300 bg-base-200 text-base-content shadow-sm"
              >
                <div className="card-body space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-base text-primary">Challenge {i + 1}</h4>
                    <button
                      onClick={() => removeChallenge(i)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Title</span>
                    </label>
                    <input
                      value={challenge.title}
                      onChange={(e) => updateChallenge(i, "title", e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      value={challenge.description}
                      onChange={(e) => updateChallenge(i, "description", e.target.value)}
                      rows={3}
                      className="textarea textarea-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Score</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={challenge.score}
                      onChange={(e) => updateChallenge(i, "score", +e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>

                  {/* Test Cases */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-secondary">Test Cases</h5>
                      <button onClick={() => addTestCase(i)} className="btn btn-sm btn-outline">
                        <Plus className="w-4 h-4 mr-1" /> Add Test Case
                      </button>
                    </div>

                    {challenge.testcases.map((testCase, j) => (
                      <div
                        key={j}
                        className="mt-4 border border-dashed border-base-300 rounded-md p-4 bg-base-100 text-base-content space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h6 className="text-sm font-semibold">Test Case {j + 1}</h6>
                          <button
                            onClick={() => removeTestCase(i, j)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Description</span>
                          </label>
                          <input
                            value={testCase.description}
                            onChange={(e) =>
                              updateTestCase(i, j, "description", e.target.value)
                            }
                            className="input input-bordered w-full"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Input</span>
                          </label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) =>
                              updateTestCase(i, j, "input", e.target.value)
                            }
                            rows={2}
                            className="textarea textarea-bordered w-full font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text">Expected Output</span>
                          </label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) =>
                              updateTestCase(i, j, "expectedOutput", e.target.value)
                            }
                            rows={2}
                            className="textarea textarea-bordered w-full font-mono text-sm"
                          />
                        </div>

                        <div className="form-control">
                          <label className="label cursor-pointer">
                            <span className="label-text">Hidden test case</span>
                            <input
                              type="checkbox"
                              className="toggle toggle-sm"
                              checked={testCase.hidden}
                              onChange={(e) =>
                                updateTestCase(i, j, "hidden", e.target.checked)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>


          <div className="card-actions justify-end pt-4">
            <button onClick={() => router.push("/dashboard/challenges")} className="btn btn-outline">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary ml-2">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
