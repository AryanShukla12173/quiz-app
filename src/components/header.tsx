import React from "react";
import Link from "next/link";

function Header() {
  return (
    <nav className="navbar sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 px-4 text-slate-900 backdrop-blur-xl lg:px-8">
      <Link href="/" className="navbar-start text-2xl font-semibold text-slate-950">
        <span className="mr-2 rounded-md bg-slate-950 px-2 py-1 text-lg text-white">
          Q
        </span>
        QuizApp
      </Link>
      <div className="navbar-end gap-2">
        <Link href="/sign-in" className="btn btn-ghost btn-sm text-slate-700">
          Admin
        </Link>
        <Link href="/test-user-sign-in" className="btn btn-sm bg-slate-950 text-white hover:bg-slate-800">
          Student
        </Link>
      </div>
    </nav>
  );
}

export default Header;
