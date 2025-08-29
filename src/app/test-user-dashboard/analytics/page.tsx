"use client";
import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/utils/trpc";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";
import { testUserDashboardNavItems } from "@/lib/constants";
import Link from "next/link";
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
  const supabase = createClient();
  const [name, setName] = useState<string>("");
  const [initials, setInitials] = useState<string>("");
  const router = useRouter();
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
  const fetchUserInitials = async () => {
    const { data, error } = await supabase
      .from("test_user_profile")
      .select("FullName")
      .single();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    if (data?.FullName) {
      setName(data.FullName);
      const arr = data.FullName.split(" ");
      const computedInitials = arr
        .map((el: string) => el[0].toUpperCase())
        .join("");
      setInitials(computedInitials);
    }
  };

  useEffect(() => {
    fetchUserInitials();
  });

  return (
    <>
      <nav className="navbar px-15 bg-base-300">
        <span className="navbar-start text-2xl font-bold text-primary">
          QuizApp
        </span>
        <div className="navbar-end gap-3 items-center">
          {testUserDashboardNavItems.map((item) => (
            <Link
              href={item.href}
              className="flex flex-row gap-2 font-bold text-md"
              key={item.id}
            >

              {item.name}
            </Link>
          ))}

          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
              <span className="text-md">{initials}</span>
            </div>
          </div>

          <span className="font-bold">{name}</span>
          <button
            className="btn btn-primary rounded-2xl"
            onClick={() => {
              supabase.auth.signOut();
              router.replace("/");
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="min-h-screen bg-base-200 font-sans text-base-content">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              My Test Analytics
            </h1>
            <p className="text-lg text-secondary mt-1">
              Review your performance and see how you stack up.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Attempted Tests */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-base-content/20">
                Attempted Tests
              </h2>
              {isLoadingTests && <LoadingSpinner />}
              {testsError && <ErrorMessage message={testsError.message} />}
              {attemptedTests && (
                <div className="space-y-3">
                  {attemptedTests.length === 0 && !isLoadingTests ? (
                    <div className="alert alert-info shadow-lg">
                      You haven &apos;t attempted any tests yet.
                    </div>
                  ) : (
                    (attemptedTests as AttemptedTest[]).map((test) => (
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
              <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-base-content/20">
                Leaderboard
              </h2>
              <div className="p-6 rounded-xl shadow-md min-h-[300px] flex flex-col  bg-base-100">
                {!selectedTestId && (
                  <p className="text-center text-base-content/50">
                    Select a test to view its leaderboard.
                  </p>
                )}
                {isLoadingLeaderboard && <LoadingSpinner />}
                {leaderboardError && (
                  <ErrorMessage message={leaderboardError.message} />
                )}
                {leaderboard && selectedTestId && (
                  <LeaderboardTable
                    leaderboardData={leaderboard as LeaderboardEntry[]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
      isSelected
        ? "bg-primary text-primary-content shadow-lg ring-2 ring-primary/40"
        : "bg-base-100 hover:bg-base-200 hover:shadow-md border-base-content/20"
    }`}
  >
    <h3 className="font-bold text-lg">{test.testTitle}</h3>
    <p
      className={`text-sm mt-1 ${
        isSelected ? "text-primary-content/90" : "text-base-content/70"
      }`}
    >
      Your Score: <span className="font-semibold">{test.totalScore}</span>
    </p>
    <p
      className={`text-xs mt-2 ${
        isSelected ? "text-primary-content/70" : "text-base-content/50"
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
        <thead className="bg-base-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">
              Enrollment ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-base-content uppercase tracking-wider">
              Total Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-base-100 divide-y divide-base-content/20">
          {leaderboardData.map((entry) => (
            <tr key={entry.userId} className="hover:bg-base-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-base-content">
                {entry.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                {entry.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content">
                {entry.enrollmentId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
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
