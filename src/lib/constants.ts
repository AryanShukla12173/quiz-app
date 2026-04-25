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


export const languageExtensions: Record<string, string> = {
  java: "java",
  python: "py",
  javascript: "js",
  c: "c",
  cpp: "cpp",
  // add more languages if needed
};
export const testUserDashboardNavItems = [
  {
    id: 1,
    name: "Dashboard",
    href: "/test-user-dashboard",
  },
  {
    id: 2,
    name: "Analytics",
    href: "/test-user-dashboard/analytics",
  },
];
