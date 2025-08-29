import React from "react";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";
function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-base-300 text-base-content p-10">
      <nav>
        <h6 className="footer-title">Services</h6>
        <a className="link link-hover">Branding</a>
        <a className="link link-hover">Design</a>
        <a className="link link-hover">Marketing</a>
        <a className="link link-hover">Advertisement</a>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <a className="link link-hover">About us</a>
        <a className="link link-hover">Contact</a>
        <a className="link link-hover">Jobs</a>
        <a className="link link-hover">Press kit</a>
      </nav>
      <nav>
        <h6 className="footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="text-base-content/60 hover:text-primary"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </nav>
    </footer>
  );
}

export default Footer;
