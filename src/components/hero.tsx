"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const dropDownItems = [
  { name: "Admin Sign In", href: "/sign-in" },
  { name: "Admin Sign Up", href: "/sign-up" },
  { name: "Code Platform Sign In", href: "/coding-platform/sign-in" },
  { name: "Code Platform Sign Up", href: "/coding-platform/sign-up" },
]

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-base-100 text-base-content">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Test Your Knowledge with{" "}
            <motion.span
              className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              QuizApp
            </motion.span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-base-content">
            Create, share, and take quizzes on any topic. Perfect for students, teachers, and curious minds.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <div className="dropdown dropdown-bottom">
              <label tabIndex={0} className="btn btn-accent text-accent-content">
                Get Started
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56 z-[1]">
                {dropDownItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          <motion.div
            className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Image
              src="/isometric_Image_landing_header.png"
              alt="Quiz App Interface"
              fill
              className="object-cover"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-b from-base-100 to-transparent -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
    </section>
  )
}
