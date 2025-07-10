'use client';

import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codeTestSchema, CodeTest } from '@/form_schemas/challengeSchema';
import { useState } from 'react';
import { addDoc, getFirestore, collection, Timestamp } from "firebase/firestore";
import { app } from '@/lib/connectDatabase';
import { useAuthUser } from '@/components/hooks/get-user';
import { Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeTestForm() {
  const db = getFirestore(app);
  const { user, loading } = useAuthUser(true);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const form = useForm<CodeTest>({
    resolver: zodResolver(codeTestSchema),
    defaultValues: {
      testTitle: '',
      testDescription: '',
      testDuration: 60,
      challenges: []
    },
    mode: 'onChange'
  });

  const { fields: challengeFields, append: appendChallenge, remove: removeChallenge } = useFieldArray({
    control: form.control,
    name: 'challenges'
  });

  const onSubmit = async (data: CodeTest) => {
    try {
      setSubmissionStatus('submitting');
      if (!loading) {
        await addDoc(collection(db, 'challenges'), {
          ...data,
          createdAt: Timestamp.now(),
          userId: user?.uid
        });
        toast.success('Code test created successfully.');
        setSubmissionStatus('success');
        setTimeout(() => {
          form.reset();
          setSubmissionStatus('idle');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating code test.');
      setSubmissionStatus('error');
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-6">

        {submissionStatus === 'success' && (
          <div className="alert alert-success shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Code test created successfully!</span>
          </div>
        )}

        {/* Test Info */}
        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-4">
            <h2 className="card-title">Create New Code Test</h2>

            <div>
              <label className="label">Test Title</label>
              <input
                type="text"
                placeholder="Enter test title"
                {...form.register('testTitle')}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Test Description</label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this test"
                {...form.register('testDescription')}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div>
              <label className="label flex gap-2 items-center">
                <Clock className="w-4 h-4" />
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min={1}
                {...form.register('testDuration', { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        {/* Problems */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Problems</h2>
          <button
            type="button"
            onClick={() =>
              appendChallenge({ title: '', description: '', score: 0, testcases: [] })
            }
            className="btn btn-outline btn-sm gap-1"
          >
            <Plus className="w-4 h-4" /> Add Problem
          </button>
        </div>

        {challengeFields.length === 0 && (
          <div className="border-dashed border-2 p-8 text-center text-gray-500 bg-base-200 rounded">
            No problems added yet. Click &quot;Add Problem&quot; to get started.
          </div>
        )}

        {challengeFields.map((challenge, index) => (
          <ChallengeCard key={challenge.id} index={index} onRemove={() => removeChallenge(index)} />
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submissionStatus === 'submitting' || challengeFields.length === 0}
            className="btn btn-primary"
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Code Test'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

function ChallengeCard({ index, onRemove }: { index: number; onRemove: () => void }) {
  const form = useFormContext();
  const { control } = form;

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase
  } = useFieldArray({
    control,
    name: `challenges.${index}.testcases`
  });

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Problem {index + 1}</h3>
          <button onClick={onRemove} className="btn btn-ghost text-red-500 btn-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              {...form.register(`challenges.${index}.title`)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">Score</label>
            <input
              type="number"
              {...form.register(`challenges.${index}.score`, { valueAsNumber: true })}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            {...form.register(`challenges.${index}.description`)}
            className="textarea textarea-bordered w-full"
            rows={4}
          />
        </div>

        <div className="divider">Test Cases ({testCaseFields.length})</div>

        <button
          type="button"
          onClick={() =>
            appendTestCase({ input: '', expectedOutput: '', description: '', hidden: false })
          }
          className="btn btn-outline btn-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Test Case
        </button>

        {testCaseFields.length === 0 && (
          <div className="border border-dashed bg-base-200 p-4 text-center text-sm text-gray-500 rounded">
            No test cases added yet.
          </div>
        )}

        {testCaseFields.map((_, idx) => (
          <div key={idx} className="collapse collapse-arrow border bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">Test Case {idx + 1}</div>
            <div className="collapse-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Input</label>
                  <textarea
                    {...form.register(`challenges.${index}.testcases.${idx}.input`)}
                    className="textarea textarea-bordered w-full font-mono text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Expected Output</label>
                  <textarea
                    {...form.register(`challenges.${index}.testcases.${idx}.expectedOutput`)}
                    className="textarea textarea-bordered w-full font-mono text-sm"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  {...form.register(`challenges.${index}.testcases.${idx}.description`)}
                  className="textarea textarea-bordered w-full text-sm"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="label cursor-pointer space-x-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    {...form.register(`challenges.${index}.testcases.${idx}.hidden`)}
                  />
                  <span className="label-text text-sm">Hidden from test-takers</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeTestCase(idx)}
                  className="btn btn-ghost text-red-500 btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
