"use client";
import {
  Brain,
  Users,
  BarChart,
  Smartphone,
  Clock,
  Shield,
} from "lucide-react";
const features = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Coding Challenges",
    description:
      "Create custom coding challenges that can be shared through code.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Quiz",
    description: "Create custom Quizzes.",
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Detailed Analytics",
    description:
      "Track your progress with comprehensive performance analytics and insights.",
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: "Mobile Friendly",
    description: "Take quizzes on the go with our responsive mobile design.",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Timed Challenges",
    description:
      "Test your knowledge under pressure with timed quiz challenges.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure Platform",
    description: "Your data and quiz content are always secure and private.",
  },
];
export default function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="mb-4">
            <div className="inline-block">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                Powerful Features
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-semibold mb-4 text-slate-950">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600">
            Discover all the tools you need to create engaging quizzes and
            enhance your learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
                <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-3 text-slate-800 transition">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
