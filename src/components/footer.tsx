"use client"

import { motion } from "framer-motion"
import {
  Github,
  Twitter,
  Facebook,
  Instagram,
  ArrowRight,
} from "lucide-react"

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
      className="bg-base-200 text-base-content border-t border-base-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={footerVariants}
    >
      <div className="container max-w-screen-xl mx-auto px-4 py-10">
        <div className="footer sm:footer-horizontal">
          {/* Section 1 - Branding */}
          <motion.div variants={itemVariants}>
            <span className="footer-title text-primary">QuizApp</span>
            <p className="max-w-xs text-sm opacity-70">
              Making learning fun and engaging through interactive quizzes.
            </p>
            <div className="flex space-x-3 mt-4">
              {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-base-content/60 hover:text-primary"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Section 2 - Product */}
          <motion.div variants={itemVariants}>
            <span className="footer-title text-primary">Product</span>
            {["Features", "Pricing", "Testimonials", "FAQ"].map((label, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ x: 5 }}
                className="link link-hover text-base-content/70 hover:text-primary transition-colors"
              >
                {label}
              </motion.a>
            ))}
          </motion.div>

          {/* Section 3 - Company */}
          <motion.div variants={itemVariants}>
            <span className="footer-title text-primary">Company</span>
            {["About Us", "Careers", "Blog", "Contact"].map((label, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ x: 5 }}
                className="link link-hover text-base-content/70 hover:text-primary transition-colors"
              >
                {label}
              </motion.a>
            ))}
          </motion.div>

          {/* Section 4 - Newsletter */}
          <motion.div variants={itemVariants}>
            <span className="footer-title text-primary">Subscribe</span>
            <p className="text-sm text-base-content/70 mb-2">
              Stay updated with our latest features and releases.
            </p>
            <form className="form-control w-72">
              <div className="join">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input input-bordered join-item w-full text-sm"
                />
                <motion.div
                  className="join-item"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary rounded-l-none"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          className="mt-10 border-t border-base-300 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/60"
          variants={itemVariants}
        >
          <p>© {currentYear} QuizApp. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((label, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -2 }}
                className="hover:text-primary transition"
              >
                {label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
