export const navItems = [
  {
    id: 1,
    name: "Admin Sign Up",
    href: "/sign-up",
  },
  {
    id: 2,
    name: "Admin Login",
    href: "/sign-in",
  },
  {
    id: 3,
    name: "Code Test Platform Sign Up",
    href: "/test-user-sign-up",
  },
  {
    id: 4,
    name: "Code Test Platform Sign In",
    href: "/test-user-sign-in",
  },
];

export const mockTests = [
  {
    testTitle: "Intermediate Algorithms Test",
    testDescription: "Focuses on slightly more complex algorithmic problems.",
    testDuration: 45,
    problem: [
      {
        title: "Factorial",
        description: "Return the factorial of a given number n.",
        score: 20,
        testcases: [
          {
            input: "5",
            expectedOutput: "120",
            description: "Normal case",
            hidden: false,
          },
          {
            input: "0",
            expectedOutput: "1",
            description: "Factorial of 0",
            hidden: false,
          },
          {
            input: "10",
            expectedOutput: "3628800",
            hidden: true,
          },
        ],
      },
      {
        title: "Check Prime",
        description: "Return true if the number is prime, otherwise false.",
        score: 25,
        testcases: [
          {
            input: "7",
            expectedOutput: "true",
            hidden: false,
          },
          {
            input: "10",
            expectedOutput: "false",
            hidden: false,
          },
          {
            input: "97",
            expectedOutput: "true",
            hidden: true,
          },
        ],
      },
    ],
  },
];

export const Languages = [
  {
    id: "java",
    name: "Java",
    languageType: "programming",
    boilerplate: `public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  },
  {
    id: "python",
    name: "Python",
    languageType: "programming",
    boilerplate: `# Write your code here
if __name__ == "__main__":
    pass`,
  },
  {
    id: "c",
    name: "C",
    languageType: "programming",
    boilerplate: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`,
  },
  {
    id: "cpp",
    name: "C++",
    languageType: "programming",
    boilerplate: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  },
];
