'use client';

import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codeTestSchema, CodeTest } from '@/form_schemas/challengeSchema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { addDoc, getFirestore } from "firebase/firestore";
import { app } from '@/lib/connectDatabase';
import { collection, Timestamp } from "firebase/firestore"; 
import { Plus, Trash2, CheckCircle2, Beaker, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthUser } from '@/components/hooks/get-user';

export default function CodeTestForm() {
  const db = getFirestore(app);
  const { user, loading } = useAuthUser(true); // will redirect if not logged in
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const form = useForm<CodeTest>({
    resolver: zodResolver(codeTestSchema),
    defaultValues: {
      testTitle: '',
      testDescription: '',
      testDuration: 60, // Default time limit of 60 minutes
      challenges: []
    },
    mode: 'onChange'
  });

  const {
    fields: challengeFields,
    append: appendChallenge,
    remove: removeChallenge
  } = useFieldArray({
    control: form.control,
    name: 'challenges'
  });

  const onSubmit = async (data: CodeTest) => {
    try {
      setSubmissionStatus('submitting');
      if (loading === false){
        console.log('Submitted Code Test:', JSON.stringify(data, null, 2));
        await addDoc(collection(db,'challenges'),{
          ...data,
          createdAt: Timestamp.now(),
          userId: user?.uid
        });
      }
      setSubmissionStatus('success');
      toast.success('Code test created', {
        description: 'Your code test has been created successfully.',
        duration: 5000,
      });
      
      // Reset form after a short delay
      setTimeout(() => {
        form.reset();
        setSubmissionStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setSubmissionStatus('error');
      toast.error('Failed to create code test', {
        description: 'There was an error creating your code test. Please try again.',
        duration: 5000,
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto">
        {submissionStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your code test has been created successfully.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Code Test</CardTitle>
            <CardDescription>Define a code test with multiple programming challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField name="testTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Test Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter test title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="testDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Test Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the purpose of this test" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="testDuration" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock size={16} /> Time Limit (minutes)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter duration in minutes"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                    value={field.value || 60}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Problems</h2>
          <Button 
            type="button" 
            onClick={() => appendChallenge({ 
              title: '', 
              description: '', 
              score: 0, 
              testcases: [] 
            })}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Problem
          </Button>
        </div>

        {challengeFields.length === 0 && (
          <Card className="bg-gray-50 border-dashed border-2 p-8 text-center">
            <p className="text-gray-500">No problems added yet. Click &quot;Add Problem&quot; to get started.</p>
          </Card>
        )}

        <div className="space-y-4">
          {challengeFields.map((challenge, index) => (
            <ChallengeCard 
              key={challenge.id} 
              index={index} 
              onRemove={() => removeChallenge(index)} 
            />
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            disabled={submissionStatus === 'submitting' || challengeFields.length === 0}
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Code Test'}
          </Button>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Problem {index + 1}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name={`challenges.${index}.title`} render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Problem title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name={`challenges.${index}.score`} render={({ field }) => (
            <FormItem>
              <FormLabel>Score</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Points"
                  {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                  value={field.value || 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField name={`challenges.${index}.description`} render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Problem description, including any requirements and constraints" 
                className="min-h-24" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Separator className="my-4" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium flex items-center gap-2">
              <Beaker size={18} /> Test Cases ({testCaseFields.length})
            </h3>
            <Button 
              type="button" 
              onClick={() => appendTestCase({ input: '', expectedOutput: '', description: '', hidden: false })}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Plus size={14} className="mr-1" /> Add Test Case
            </Button>
          </div>

          {testCaseFields.length === 0 && (
            <div className="bg-gray-50 border border-dashed p-4 rounded-md text-center">
              <p className="text-sm text-gray-500">No test cases added yet</p>
            </div>
          )}

          <Accordion type="multiple" className="space-y-2">
            {testCaseFields.map((field, idx) => (
              <AccordionItem key={field.id} value={`test-${index}-${idx}`} className="border bg-gray-50">
                <AccordionTrigger className="px-4 py-2 text-sm">
                  Test Case {idx + 1}
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name={`challenges.${index}.testcases.${idx}.input`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input</FormLabel>
                        <FormControl>
                          <Textarea className="font-mono text-sm" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name={`challenges.${index}.testcases.${idx}.expectedOutput`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Output</FormLabel>
                        <FormControl>
                          <Textarea className="font-mono text-sm" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField name={`challenges.${index}.testcases.${idx}.description`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain what this test case is checking for" 
                          className="text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex items-center justify-between">
                    <FormField name={`challenges.${index}.testcases.${idx}.hidden`} render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm">Hidden from test-takers</FormLabel>
                      </FormItem>
                    )} />

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeTestCase(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}