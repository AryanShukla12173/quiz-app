"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Brain, Users, BarChart, Smartphone, Clock, Shield } from "lucide-react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <div className="badge badge-accent badge-lg py-3 px-4 text-white">Powerful Features</div>
            </motion.div>
          </div>
          <motion.h2
            className="text-4xl font-bold mb-4 text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Everything You Need
          </motion.h2>
          <motion.p
            className="text-lg text-base-content/70"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover all the tools you need to create engaging quizzes and enhance your learning experience.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-all group"
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.25)",
              }}
            >
              <div className="card-body">
                <div className="bg-primary/10 text-primary p-3 rounded-lg inline-block mb-4 group-hover:bg-primary/20 transition">
                  {feature.icon}
                </div>
                <h3 className="card-title group-hover:text-primary">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
