/**
 * Cookies Policy Page
 */

import { Cookie, Settings, BarChart3, Zap, Mail, ChevronRight } from "lucide-react";

export const Cookies = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-[#FF5100] transition-colors">Home</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Cookie Policy</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF5100]/10 rounded-lg flex items-center justify-center">
              <Cookie className="w-6 h-6 text-[#FF5100]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Cookie Policy</h1>
              <p className="text-gray-500 mt-1">Last updated: January 15, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">
          {/* Introduction */}
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            This Cookie Policy explains how PMP Portal uses cookies and similar technologies 
            to recognize you when you visit our platform. It explains what these technologies 
            are and why we use them, as well as your rights to control our use of them.
          </p>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">1</span>
              What Are Cookies?
            </h2>
            <p className="text-gray-600 leading-relaxed pl-11">
              Cookies are small text files that are placed on your computer or mobile device when you 
              visit a website. They are widely used to make websites work more efficiently and provide 
              information to the owners of the site. Cookies help us remember your preferences, 
              understand how you use our platform, and improve your overall experience.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">2</span>
              How We Use Cookies
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies for several purposes to enhance your experience:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Keep you signed in so you don't have to log in repeatedly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Track your exam progress and save your learning path</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Understand how you use our platform to make improvements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Personalize content based on your preferences and study habits</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 - Cookie Types */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">3</span>
              Types of Cookies We Use
            </h2>
            <div className="pl-11 space-y-6">
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Required</span>
                </div>
                <p className="text-gray-600 text-sm">
                  These cookies are necessary for the platform to function. They enable core features 
                  like security, account access, and remembering your session.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Performance Cookies</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Analytics</span>
                </div>
                <p className="text-gray-600 text-sm">
                  These help us understand how visitors interact with our platform by collecting 
                  anonymous information. We use this data to improve performance and user experience.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Functionality Cookies</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Preferences</span>
                </div>
                <p className="text-gray-600 text-sm">
                  These remember your preferences and settings, such as language preferences, 
                  theme settings, and exam mode preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">4</span>
              Managing Your Cookie Preferences
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                You have control over cookies. Most web browsers allow you to manage cookies through 
                their settings. You can:
              </p>
              <ul className="space-y-3 text-gray-600 mb-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>View and delete cookies stored on your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Block third-party cookies entirely</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Set your browser to notify you when cookies are being set</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Delete all cookies automatically when you close your browser</span>
                </li>
              </ul>
              <p className="text-gray-500 text-sm italic">
                Note: Disabling certain cookies may limit functionality and affect your experience on our platform.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#FF5100]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#FF5100]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Questions about cookies?</h3>
                <p className="text-gray-600">
                  Reach out to us at{" "}
                  <a 
                    href="mailto:support@pmpportal.com" 
                    className="text-[#FF5100] hover:underline font-medium"
                  >
                    support@pmpportal.com
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;