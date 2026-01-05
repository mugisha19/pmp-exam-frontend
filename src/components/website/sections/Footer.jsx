/**
 * Footer Component
 * Website footer with links and information
 */

import { Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Learn",
      links: [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Browse Exams", path: "/browse" },
        { label: "My Learning", path: "/my-learning" },
        { label: "Learning Paths", path: "/learning-paths" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Study Groups", path: "/my-groups" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Profile", path: "/profile" },
        { label: "Support", path: "/support" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-bg-secondary border-t border-border-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 group mb-4"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    PMP Portal
                  </h2>
                  <p className="text-xs text-text-tertiary font-medium">
                    Master Your Certification
                  </p>
                </div>
              </Link>
              <p className="text-text-tertiary text-sm mb-6 max-w-md">
                Your comprehensive platform for PMP exam preparation. Practice
                with real questions, track your progress, and learn with a
                community of aspiring project managers.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-white hover:bg-primary-50 text-text-tertiary hover:text-primary-600 rounded-lg transition-colors duration-200"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        onClick={() => console.log("[Footer] Navigating to:", link.path)}
                        className="text-text-tertiary hover:text-primary-600 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-light py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-tertiary">
              © {currentYear} PMP Exam Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-text-tertiary">
              <Link
                to="/privacy"
                className="hover:text-primary-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-primary-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="hover:text-primary-600 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
