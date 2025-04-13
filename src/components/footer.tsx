"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, Twitter, Facebook, Instagram, ArrowRight } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.footer
      className="bg-gradient-to-br from-violet-900 to-purple-900 text-white py-12 border-t border-violet-800"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={footerVariants}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">QuizApp</h3>
            <p className="text-violet-200">Making learning fun and engaging through interactive quizzes.</p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="text-violet-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </motion.a>
              <motion.a
                href="#"
                className="text-violet-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </motion.a>
              <motion.a
                href="#"
                className="text-violet-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </motion.a>
              <motion.a
                href="#"
                className="text-violet-200 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Product</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Features
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Pricing
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Testimonials
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  FAQ
                </motion.a>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Company</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Careers
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Blog
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  className="text-violet-200 hover:text-white transition-colors block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Contact
                </motion.a>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold">Subscribe</h3>
            <p className="text-violet-200">Stay updated with our latest features and releases.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                type="email"
                className="max-w-[220px] bg-violet-800/50 border-violet-700 text-white placeholder:text-violet-300"
              />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="icon"
                  className="bg-white text-violet-800 hover:bg-violet-100"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="pt-8 border-t border-violet-800 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-violet-300">© {currentYear} QuizApp. All rights reserved.</p>
          <div className="flex gap-6">
            <motion.a
              href="#"
              className="text-sm text-violet-300 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Privacy Policy
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-violet-300 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Terms of Service
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-violet-300 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Cookies
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}