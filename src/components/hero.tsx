"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"

const MotionButton = motion(Button)
const dropDownItems = [
  { name: " Admin Sign In", href: "/sign-in", variant: "primary" },
  { name: "Admin Sign Up", href: "/sign-up", variant: "outline" },
  { name : "Code Platform Sign In", href: "/coding-platform/sign-in", variant: "outline" },
  { name: "Code Platform Sign Up", href: "/coding-platform/sign-up", variant: "outline" },

]
export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Test Your Knowledge with{" "}
              <motion.span
                className=" bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 text-purple-600"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                QuizApp
              </motion.span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
              Create, share, and take quizzes on any topic. Perfect for students, teachers, and curious minds.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">


              {/* Dropdown Menu Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MotionButton
                    size="lg"
                    variant="outline"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Get Started
                  </MotionButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2">
                  {dropDownItems.map((item, index) => (
                    <DropdownMenuItem
                      asChild
                      key={index}
                      className="mt-1 border px-3 py-2 rounded transition-colors data-[highlighted]:bg-purple-600 data-[highlighted]:text-white"
                    >
                      <Link href={item.href} className="w-full h-full block">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                </DropdownMenuContent>
              </DropdownMenu>
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
                className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              />
            </motion.div>


          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-b from-violet-50 to-transparent -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
    </section>
  )
}
