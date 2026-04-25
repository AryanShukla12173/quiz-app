"use client";
import React, { useMemo } from "react";
import { trpc } from "@/lib/utils/trpc";
import { StudentNav } from "@/components/student-nav";
import { BarChart3, ClipboardList, Medal } from "lucide-react";
interface AttemptedTest {
  testId: string;
  testTitle: string;
  totalScore: number;
  lastSubmittedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string | null;
  enrollmentId: string | null;
  totalScore: number;
}

function AnalyticsPage() {
  const [selectedTestId, setSelectedTestId] = React.useState<string | null>(
    null
  );
  const { data: profile } = trpc.getMyTestUserProfile.useQuery();
  const name = (profile?.fullName as string | undefined) ?? "";
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .map((el) => el[0].toUpperCase())
        .join(""),
    [name]
  );
  const {
    data: attemptedTests,
    isLoading: isLoadingTests,
    error: testsError,
  } = trpc.getAllTestsAttemptedByUser.useQuery();

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = trpc.getLeaderboardByTestId.useQuery(
    { codeTestId: selectedTestId! },
    { enabled: !!selectedTestId }
  );
  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNav name={name} initials={initials} />

      <div className="font-sans text-base-content">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase">
                Analytics
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
              My Test Performance
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Select an attempted test to compare your score with the
              leaderboard.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Attempted Tests */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-slate-900" />
                <h2 className="text-xl font-semibold text-slate-950">Attempted Tests</h2>
              </div>
              {isLoadingTests && <LoadingSpinner />}
              {testsError && <ErrorMessage message={testsError.message} />}
              {attemptedTests && (
                <div className="space-y-3">
                  {attemptedTests.length === 0 && !isLoadingTests ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                      <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                      <p className="font-semibold text-slate-950">No attempts yet</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Completed tests will appear here.
                      </p>
                    </div>
                  ) : (
                    (attemptedTests as unknown as AttemptedTest[]).map((test) => (
                      <TestCard
                        key={test.testId}
                        test={test}
                        isSelected={selectedTestId === test.testId}
                        onSelect={() => setSelectedTestId(test.testId)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Leaderboard */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Medal className="h-5 w-5 text-slate-900" />
                <h2 className="text-xl font-semibold text-slate-950">Leaderboard</h2>
              </div>
              <div className="flex min-h-[320px] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {!selectedTestId && (
                  <div className="m-auto text-center text-slate-500">
                    <Medal className="mx-auto mb-3 h-10 w-10 opacity-40" />
                    <p className="font-medium">Select a test to view rankings.</p>
                  </div>
                )}
                {isLoadingLeaderboard && <LoadingSpinner />}
                {leaderboardError && (
                  <ErrorMessage message={leaderboardError.message} />
                )}
                {leaderboard && selectedTestId && (
                  <LeaderboardTable
                    leaderboardData={leaderboard as unknown as LeaderboardEntry[]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TestCard = ({
  test,
  isSelected,
  onSelect,
}: {
  test: AttemptedTest;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    onClick={onSelect}
    className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
      isSelected
        ? "bg-slate-950 text-white shadow-lg ring-2 ring-slate-300"
        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:shadow-md"
    }`}
  >
    <h3 className="font-bold text-lg">{test.testTitle}</h3>
    <p
      className={`mt-1 text-sm ${
        isSelected ? "text-slate-200" : "text-slate-600"
      }`}
    >
      Your Score: <span className="font-semibold">{test.totalScore}</span>
    </p>
    <p
      className={`mt-2 text-xs ${
        isSelected ? "text-slate-300" : "text-slate-500"
      }`}
    >
      Submitted on: {new Date(test.lastSubmittedAt).toLocaleDateString()}
    </p>
  </button>
);

const LeaderboardTable = ({
  leaderboardData,
}: {
  leaderboardData: LeaderboardEntry[];
}) => {
  if (leaderboardData.length === 0) {
    return (
      <div className="alert alert-info shadow-lg text-center">
        No leaderboard data available for this test yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-base-content/20">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase">
              Enrollment ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase">
              Total Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-base-100 divide-y divide-base-content/20">
          {leaderboardData.map((entry) => (
            <tr key={entry.userId} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                {entry.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                {entry.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                {entry.enrollmentId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-950">
                {entry.totalScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="alert alert-error shadow-lg">
    <span className="font-bold">Error: </span> {message}
  </div>
);

export default AnalyticsPage;
