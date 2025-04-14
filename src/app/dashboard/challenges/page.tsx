'use client';

import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codeTestSchema, CodeTest, Language } from '@/form_schemas/challengeSchema';
import {
  Input
} from '@/components/ui/input';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Button
} from '@/components/ui/button';
import {
  Card, CardContent
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useState } from 'react';
import { Path } from 'react-hook-form';

export default function CodeTestForm() {
  const form = useForm<CodeTest>({
    resolver: zodResolver(codeTestSchema),
    defaultValues: {
      testTitle: '',
      testDescription: '',
      challenges: []
    }
  });

  const {
    fields: challengeFields,
    append: appendChallenge,
    remove: removeChallenge
  } = useFieldArray({
    control: form.control,
    name: 'challenges'
  });

  const [activeTab, setActiveTab] = useState('0');

  const onSubmit = (data: CodeTest) => {
    console.log('✅ Form submitted');
    console.log('Submitted Code Test:', JSON.stringify(data, null, 2));
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-100 text-purple-900 p-6 rounded-xl shadow-md max-w-full overflow-x-hidden">
        <div className="space-y-4">
          <FormField name="testTitle" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="bg-white/90 border-purple-300" placeholder="Test Title" {...field} />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )} />

          <FormField name="testDescription" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className="bg-white/90 border-purple-300" placeholder="Test Description" rows={3} {...field} />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-auto">
          <TabsList className="flex flex-wrap gap-1 mb-4 max-w-full overflow-x-auto">
            {challengeFields.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()} className="truncate">
                Problem {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {challengeFields.map((challenge, index) => (
            <TabsContent key={challenge.id} value={index.toString()} className="overflow-x-hidden">
              <Card className="bg-white/90 border border-purple-200">
                <CardContent className="space-y-3 py-4">
                  <FormField name={`challenges.${index}.title`} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="bg-white/95" placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )} />

                  <FormField name={`challenges.${index}.description`} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="bg-white/95" placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )} />

                  <FormField name={`challenges.${index}.score`} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-white/95"
                          placeholder="Score for this problem"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )} />

                  <FormField name={`challenges.${index}.language`} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-white/95 border-purple-300">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {Object.values(Language).map((lang) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )} />

                  <TestCaseFieldArray nestIndex={index} />

                  <Button variant="destructive" type="button" onClick={() => removeChallenge(index)}>
                    Remove Problem
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Button className="bg-purple-700 hover:bg-purple-800 text-white" type="button" onClick={() => appendChallenge({ title: '', description: '', language: Language.JavaScript, score: 0, testcases: [] })}>
          Add Problem
        </Button>

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          Submit Full Code Test
        </Button>
      </form>
    </FormProvider>
  );
}

function TestCaseFieldArray({ nestIndex }: { nestIndex: number }) {
  const form = useFormContext();
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `challenges.${nestIndex}.testcases`
  });

  return (
    <div className="space-y-2">
      {fields.map((field, idx) => (
        <div key={field.id} className="p-3 border border-purple-200 bg-white/80 rounded-md space-y-2">
          <FormItem>
            <FormControl>
              <Input className="bg-white/95" placeholder="Input" {...register(`challenges.${nestIndex}.testcases.${idx}.input`)} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>

          <FormItem>
            <FormControl>
              <Input className="bg-white/95" placeholder="Expected Output" {...register(`challenges.${nestIndex}.testcases.${idx}.expectedOutput`)} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>

          <FormItem>
            <FormControl>
              <Textarea className="bg-white/95" placeholder="Description (optional)" {...register(`challenges.${nestIndex}.testcases.${idx}.description`)} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>

          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Checkbox {...register(`challenges.${nestIndex}.testcases.${idx}.hidden`)} />
            </FormControl>
            <FormLabel>Hidden</FormLabel>
            <FormMessage className="text-sm" />
          </FormItem>

          <Button variant="ghost" type="button" onClick={() => remove(idx)}>
            Remove Test Case
          </Button>
        </div>
      ))}
      <Button type="button" className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => append({ input: '', expectedOutput: '', hidden: false })}>
        Add Test Case
      </Button>
    </div>
  );
}
