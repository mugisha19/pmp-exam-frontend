/**
 * Footer Component
 * Website footer with links and information
 */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Learn",
      links: [
        { label: "Home", path: "/home" },
        { label: "Browse Exams", path: "/my-exams" },
        { label: "My Learning", path: "/my-learning" },
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
        { label: "Profile", path: "/my-profile" },
        { label: "Support", path: "/my-support" },
      ],
    },
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
                to="/home"
                onClick={(e) => {
                  e.preventDefault();
                  
                  if (location.pathname === '/home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    const root = document.getElementById('root');
                    root.style.transition = 'opacity 0.3s ease-in-out';
                    root.style.opacity = '0';
                    
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      navigate('/home', { replace: true });
                      setTimeout(() => {
                        root.style.opacity = '1';
                      }, 50);
                    }, 300);
                  }
                }}
                className="flex items-center gap-3 group mb-4 transition-all duration-300 hover:scale-105"
              >
                <img src="/pmp logo.png" alt="PMP Portal" className="w-12 h-12 object-contain" />
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
                        onClick={(e) => {
                          if (link.label === "Home" && location.pathname === link.path) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
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
