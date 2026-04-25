import React from "react";
import Image from "next/image";
import HeroImage from "../../public/isometric_Image_landing_header.png";
import { navItems } from "@/lib/constants";
import Link from "next/link";
function Hero() {
  return (
    <section className="relative min-h-[78vh] overflow-hidden">
      <Image
        src={HeroImage}
        alt="QuizApp coding test workspace illustration"
        fill
        className="object-cover opacity-20"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/88 to-emerald-50/75" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-center px-4 py-16">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Coding tests for classrooms
          </div>
          <h1 className="text-5xl font-semibold leading-tight text-slate-950 md:text-6xl lg:text-7xl">
            QuizApp
          </h1>
          <p className="max-w-2xl py-6 text-lg leading-8 text-slate-600">
            Create timed coding tests, share test IDs with students, and review
            results from one focused workspace.
          </p>
          <details className="dropdown">
            <summary className="btn rounded-md bg-slate-950 text-white hover:bg-slate-800">
              Get Started
            </summary>
            <ul className="menu dropdown-content z-20 mt-2 w-64 rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg text-white">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-3 px-4 pb-8 md:grid-cols-3">
        {["Create tests", "Run code", "Track scores"].map((label) => (
          <div
            key={label}
            className="modern-panel rounded-lg p-4"
          >
            <p className="font-semibold text-slate-900">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Hero;
