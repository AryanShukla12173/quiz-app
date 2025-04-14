'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeTest } from '@/form_schemas/challengeSchema';

type ChallengeListProps = {
  challenges?: CodeTest['challenges']; // optional prop for safety
};

export default function ChallengeList({ challenges = [] }: ChallengeListProps) {
  if (!Array.isArray(challenges)) {
    console.warn('⚠️ ChallengeList: challenges prop is not an array');
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-purple-900">Previously Created Challenges</h2>
      <ScrollArea className="h-96 rounded-md border border-purple-200 p-4 bg-white/80">
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <p className="text-sm text-gray-500">No challenges created yet.</p>
          ) : (
            challenges.map((challenge, index) => (
              <Card key={index} className="bg-white/90 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-purple-800">
                      {index + 1}. {challenge?.title || 'Untitled Challenge'}
                    </h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {challenge?.language || 'N/A'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {challenge?.description || 'No description'}
                  </p>
                  <p className="text-sm text-gray-500">Score: {challenge?.score ?? 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    Test Cases: {challenge?.testcases?.length ?? 0}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
