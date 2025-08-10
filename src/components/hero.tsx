import React from "react";
import Image from "next/image";
import HeroImage from "../../public/isometric_Image_landing_header.png";
import { navItems } from "@/lib/constants";
import Link from "next/link";
function Hero() {
  return (
    <section className="hero bg-base-200 h-[80vh]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <Image
          src={HeroImage}
          alt="#"
          className="object-cover h-[400px] w-[900px] rounded space-y-5"
          priority
        />
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl  font-bold">
            Test Your Knowledge with QuizApp
          </h1>
          <p className="py-6">
            Create, share, and take quizzes on any topic. Perfect for students,
            teachers, and curious minds.
          </p>
          <details className="dropdown">
            <summary className="btn btn-primary m-1 rounded">
              Get Started
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm ">
              {navItems.map((item) => (
                <li key={item.id} className="hover:bg-accent rounded">
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}

export default Hero;
