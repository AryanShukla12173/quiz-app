"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Update theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark"
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme)
      setTheme(savedTheme)
    }
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Toggle theme handler
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const navItems = [{ name: "Home", href: "/" }]
  const drawerItems = [
    { name: "Admin Sign In", href: "/sign-in", variant: "primary" },
    { name: "Admin Sign Up", href: "/sign-up", variant: "outline" },
    { name: "Code Platform Sign In", href: "/coding-platform/sign-in", variant: "outline" },
    { name: "Code Platform Sign Up", href: "/coding-platform/sign-up", variant: "outline" },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? "bg-base-100 shadow-md" : "bg-base-100"}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">QuizApp</Link>

          {/* Nav + Theme Toggle + CTA */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-base-content hover:text-accent">
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Theme Controller with Icons */}
            <label className="flex cursor-pointer gap-2 items-center">
              {/* Sun Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>

              <input
                type="checkbox"
                className="toggle theme-controller"
                checked={theme === "dark"}
                onChange={handleThemeToggle}
              />

              {/* Moon Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </label>

            {/* CTA */}
            <button onClick={() => setIsDrawerOpen(true)} className="btn btn-accent text-accent-content btn-sm">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-base-100 shadow-xl transition-transform duration-300 transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h3 className="text-lg font-semibold text-primary">Account</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsDrawerOpen(false)}>
              <X className="h-5 w-5 text-base-content" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {drawerItems.map((item) => (
              <Link href={item.href} key={item.name}>
                <button className={`btn w-full ${item.variant === "primary" ? "btn-primary" : "btn-outline"}`}>
                  {item.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
