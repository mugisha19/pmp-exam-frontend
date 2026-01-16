/**
 * Terms of Service Page
 */

import { FileText, CheckCircle, UserCheck, AlertTriangle, Scale, Mail, ChevronRight, XCircle, Clock, CreditCard } from "lucide-react";

export const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-[#FF5100] transition-colors">Home</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Terms of Service</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF5100]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#FF5100]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Terms of Service</h1>
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
            Welcome to PMP Portal. These terms govern your use of our platform and services. 
            By accessing or using PMP Portal, you agree to be bound by these terms. 
            Please read them carefully before using our services.
          </p>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">1</span>
              Acceptance of Terms
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed">
                By creating an account or using any part of PMP Portal, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service and our Privacy Policy. 
                If you do not agree with any part of these terms, you may not use our platform.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">2</span>
              Your Account
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                When you create an account with us, you agree to:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Provide accurate and complete information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Maintain the security of your password and account</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Accept responsibility for all activities under your account</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 - License */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">3</span>
              License to Use
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to access and use 
                PMP Portal for personal, non-commercial purposes. This license includes:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Access to exam materials</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Progress tracking features</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Practice exams and quizzes</span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Community features</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Prohibited Uses */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">4</span>
              Prohibited Activities
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to engage in any of the following:
              </p>
              <div className="bg-red-50 border border-red-100 rounded-lg p-5">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Sharing or distributing our copyrighted exam content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Using automated systems or bots to access the platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Attempting to bypass security measures or access restricted areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Sharing your account credentials with others</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Using the platform for any illegal purpose</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">5</span>
              Limitation of Liability
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed">
                PMP Portal is provided "as is" without warranties of any kind. We do not guarantee 
                that using our platform will result in passing any certification exam. To the maximum 
                extent permitted by law, we shall not be liable for any indirect, incidental, special, 
                or consequential damages arising from your use of the platform.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">6</span>
              Changes to Terms
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify you of significant 
                changes via email or through the platform. Continued use of the service after changes 
                constitutes acceptance of the updated terms.
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
                <h3 className="font-medium text-gray-900 mb-1">Questions about these terms?</h3>
                <p className="text-gray-600">
                  Contact our legal team at{" "}
                  <a 
                    href="mailto:legal@pmpportal.com" 
                    className="text-[#FF5100] hover:underline font-medium"
                  >
                    legal@pmpportal.com
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

export default Terms;