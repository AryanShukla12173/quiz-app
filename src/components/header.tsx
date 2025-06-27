"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
  ]

  const drawerItems = [
    { name: "Admin Sign In", href: "/sign-in", variant: "primary" },
    { name: "Admin Sign Up", href: "/sign-up", variant: "outline" },
    { name: "Code Platform Sign In", href: "/coding-platform/sign-in", variant: "outline" },
    { name: "Code Platform Sign Up", href: "/coding-platform/sign-up", variant: "outline" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${
          isScrolled
            ? "bg-purple-600 shadow-md text-white"
            : "bg-purple-600 text-white"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-white">
                QuizApp
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-purple-300 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <Button 
              className="bg-white text-purple-600 hover:bg-white/90 rounded-full"
              onClick={() => setIsDrawerOpen(true)}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Horizontal Drawer */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col w-64 ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-lg text-purple-600">Account</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDrawerOpen(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          
          <div className="flex flex-col p-4 gap-3">
            {drawerItems.map((item) => (
              <Link href={item.href} key={item.name}>
                <Button 
                  className={`w-full ${
                    item.variant === "primary" 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "border border-purple-600 bg-white text-purple-600 hover:bg-purple-50"
                  }`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
