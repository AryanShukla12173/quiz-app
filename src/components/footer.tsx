import React from "react";
function Footer() {
  return (
    <footer className="footer border-t border-slate-200 bg-white p-10 text-slate-700 sm:footer-horizontal">
      <nav>
        <h6 className="footer-title text-slate-950">QuizApp</h6>
        <p className="max-w-sm text-sm text-slate-500">
          A focused coding test platform for admins and students.
        </p>
      </nav>
      <nav>
        <h6 className="footer-title">Admin</h6>
        <a href="/sign-in" className="link link-hover">Sign In</a>
        <a href="/sign-up" className="link link-hover">Create Account</a>
      </nav>
      <nav>
        <h6 className="footer-title">Student</h6>
        <a href="/test-user-sign-in" className="link link-hover">Sign In</a>
        <a href="/test-user-sign-up" className="link link-hover">Create Account</a>
      </nav>
    </footer>
  );
}

export default Footer;
