"use client"
import { Brain, Users, BarChart, Smartphone, Clock, Shield } from "lucide-react"
const features = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Coding Challenges",
    description: "Create custom coding challenges that can be shared through code.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Quiz",
    description: "Create custom Quizzes.",
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Detailed Analytics",
    description: "Track your progress with comprehensive performance analytics and insights.",
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: "Mobile Friendly",
    description: "Take quizzes on the go with our responsive mobile design.",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Timed Challenges",
    description: "Test your knowledge under pressure with timed quiz challenges.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure Platform",
    description: "Your data and quiz content are always secure and private.",
  },
]
export default function Features() {



  return (
    <section id="features" className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="mb-4">
            <div

              className="inline-block"
            >
              <div className="badge badge-accent badge-lg py-3 px-4 text-white">Powerful Features</div>
            </div>
          </div>
          <h2
            className="text-4xl font-bold mb-4 text-primary"
          >
            Everything You Need
          </h2>
          <p
            className="text-lg text-base-content/70"
    
          >
            Discover all the tools you need to create engaging quizzes and enhance your learning experience.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="card-body">
                <div className="bg-primary/10 text-primary p-3 rounded-lg inline-block mb-4 group-hover:bg-primary/20 transition">
                  {feature.icon}
                </div>
                <h3 className="card-title group-hover:text-primary">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}