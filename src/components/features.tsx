"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Brain, Users, BarChart, Smartphone, Clock, Shield } from "lucide-react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const features = [
    {
      icon: <Brain className="h-10 w-10" />,
      title: "Coding Challenges",
      description: "Create custom coding challenges that can be shared through code.",
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Quiz ",
      description: "Create custom Quizzes.",
    },
    {
      icon: <BarChart className="h-10 w-10" />,
      title: "Detailed Analytics",
      description: "Track your progress with comprehensive performance analytics and insights.",
    },
    {
      icon: <Smartphone className="h-10 w-10" />,
      title: "Mobile Friendly",
      description: "Take quizzes on the go with our responsive mobile design.",
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Timed Challenges",
      description: "Test your knowledge under pressure with timed quiz challenges.",
    },
    {
      icon: <Shield className="h-10 w-10" />,
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
    <section id="features" className="py-20 bg-gradient-to-b from-white to-violet-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Powerful Features
            </div>
          </motion.div>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-purple-700"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Everything You Need
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
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
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-violet-100 group"
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.25)",
              }}
            >
              <motion.div
                className="text-violet-600 mb-4 p-3 bg-violet-50 rounded-lg inline-block group-hover:bg-violet-100 transition-colors duration-300"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
