/**
 * Privacy Policy Page
 */

import { Shield, Lock, Eye, Database, Mail, ChevronRight, Users, Globe } from "lucide-react";

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-[#FF5100] transition-colors">Home</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Privacy Policy</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF5100]/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#FF5100]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Privacy Policy</h1>
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
            At PMP Portal, we take your privacy seriously. This policy describes how we collect, 
            use, and protect your personal information when you use our exam preparation platform. 
            We believe in transparency and want you to understand exactly what happens with your data.
          </p>

          {/* Quick Summary Box */}
          <div className="bg-[#6EC1E4]/10 border border-[#6EC1E4]/20 rounded-lg p-6 mb-12">
            <h3 className="font-medium text-gray-900 mb-3">Quick Summary</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6EC1E4] rounded-full"></span>
                We only collect data necessary to provide our service
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6EC1E4] rounded-full"></span>
                We never sell your personal information to third parties
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6EC1E4] rounded-full"></span>
                You can request deletion of your data at any time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6EC1E4] rounded-full"></span>
                We use industry-standard security measures
              </li>
            </ul>
          </div>

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">1</span>
              Information We Collect
            </h2>
            <div className="pl-11 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Information you provide</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Account details (name, email address, password)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Profile information you choose to add</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Payment information (processed securely by our payment provider)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Information collected automatically</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Exam scores and learning progress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Usage patterns and time spent on platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Device information and IP address</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">2</span>
              How We Use Your Information
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use your information solely to provide and improve our services:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Eye className="w-5 h-5 text-[#FF5100] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Personalize Learning</p>
                    <p className="text-gray-500 text-sm">Tailor content to your progress and goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-[#FF5100] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Track Progress</p>
                    <p className="text-gray-500 text-sm">Save your scores and study history</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-[#FF5100] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Communicate</p>
                    <p className="text-gray-500 text-sm">Send updates and respond to questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-[#FF5100] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Improve Platform</p>
                    <p className="text-gray-500 text-sm">Analyze usage to build better features</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">3</span>
              Information Sharing
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information. We may share data only in these cases:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Service providers:</strong> Trusted partners who help us operate (hosting, payment processing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Legal requirements:</strong> When required by law or to protect rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>With your consent:</strong> Any other sharing only with your explicit permission</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">4</span>
              Data Security
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  <Lock className="w-3.5 h-3.5" /> SSL Encryption
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  <Shield className="w-3.5 h-3.5" /> Secure Servers
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  <Users className="w-3.5 h-3.5" /> Access Controls
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  <Database className="w-3.5 h-3.5" /> Regular Backups
                </span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-[#6EC1E4]/20 rounded-full flex items-center justify-center text-sm font-medium text-[#6EC1E4]">5</span>
              Your Rights
            </h2>
            <div className="pl-11">
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Access and download your personal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Correct inaccurate information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Request deletion of your account and data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FF5100] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Opt out of marketing communications</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#FF5100]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#FF5100]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Questions about your privacy?</h3>
                <p className="text-gray-600">
                  Contact our team at{" "}
                  <a 
                    href="mailto:privacy@pmpportal.com" 
                    className="text-[#FF5100] hover:underline font-medium"
                  >
                    privacy@pmpportal.com
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

export default Privacy;