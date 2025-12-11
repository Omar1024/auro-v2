"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, Database, UserCheck, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F5F5F0] selection:bg-[#F7FF00] selection:text-black">
      <Navbar />
      
      {/* Background Blur Effects */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[#F7FF00]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] bg-[#F7FF00]/10 rounded-full blur-[80px]" />
      </div>

      <main className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-block p-4 rounded-2xl bg-[#F7FF00] border-3 border-black shadow-[4px_4px_0px_0px_#000000] mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="h-12 w-12 text-black" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-3">
              Privacy Policy
            </h1>
            
            <p className="text-gray-600 font-medium text-sm sm:text-base">
              Effective Date: To be announced upon public launch
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-black shadow-[8px_8px_0px_0px_#000000] space-y-8">
              {/* Introduction */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <Eye className="h-6 w-6 text-black" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  At Auro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our anonymous messaging service. Please read this privacy policy carefully.
                </p>
              </section>

              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <Database className="h-6 w-6 text-black" />
                  1. Information We Collect
                </h2>
                
                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="text-xl font-black text-black mb-2">1.1 Personal Information</h3>
                    <p className="text-gray-700 leading-relaxed font-medium mb-2">
                      When you create an account, we collect:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                      <li>Email address</li>
                      <li>Username</li>
                      <li>Password (encrypted)</li>
                      <li>Account creation date</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-black mb-2">1.2 Message Data</h3>
                    <p className="text-gray-700 leading-relaxed font-medium mb-2">
                      We store:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                      <li>Content of messages sent and received</li>
                      <li>Timestamps of messages</li>
                      <li>Reply status (public/private)</li>
                      <li>Anonymous sender identifiers (hashed)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-black mb-2">1.3 Technical Information</h3>
                    <p className="text-gray-700 leading-relaxed font-medium mb-2">
                      For security and moderation purposes, we collect:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                      <li>IP addresses (hashed for anonymity)</li>
                      <li>Browser type and version</li>
                      <li>Device information</li>
                      <li>Access times and dates</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-black mb-2">1.4 Cookies and Tracking</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      We use essential cookies for authentication and session management. We do not currently use third-party tracking cookies or analytics services. If this changes in the future, we will update this policy and notify users.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <Lock className="h-6 w-6 text-black" />
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-2">
                  We use the collected information to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Provide and maintain the Service</li>
                  <li>Authenticate users and manage accounts</li>
                  <li>Deliver messages between users</li>
                  <li>Prevent abuse, spam, and harassment</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Respond to legal requests and prevent harm</li>
                  <li>Improve and optimize the Service</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">3. Anonymity and Data Protection</h2>
                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="text-xl font-black text-black mb-2">3.1 Anonymous Messaging</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      When you send an anonymous message, we do not reveal your identity to the recipient. However, we store a hashed version of your IP address for moderation and abuse prevention purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-black mb-2">3.2 Data Security</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      We implement industry-standard security measures to protect your data, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2 font-medium">
                      <li>Encrypted data transmission (HTTPS/SSL)</li>
                      <li>Secure password hashing</li>
                      <li>Regular security audits</li>
                      <li>Access controls and authentication</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">4. Data Sharing and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-2">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Safety and Security:</strong> To protect against fraud, abuse, or threats to safety</li>
                  <li><strong>Service Providers:</strong> With trusted service providers who assist in operating our service (e.g., hosting providers) under strict confidentiality agreements</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">5. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time. After deletion:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li><strong>Account Information:</strong> Permanently deleted immediately upon request</li>
                  <li><strong>Messages:</strong> Stored indefinitely unless deleted by the inbox owner</li>
                  <li><strong>Deleted Content:</strong> Removed from our active database immediately, but may persist in backups for up to 30 days</li>
                  <li><strong>IP Hashes:</strong> Retained for security and moderation purposes for 90 days after last activity</li>
                  <li>We may retain certain information for legal compliance or security purposes as required by law</li>
                </ul>
                <p className="text-gray-700 leading-relaxed font-medium mt-4">
                  <strong>Note:</strong> When you delete your account, all your data is permanently removed from our systems. This action cannot be undone.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-black" />
                  6. Your Rights and Choices
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-2">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and all associated data (permanent and irreversible)</li>
                  <li><strong>Export:</strong> Data export functionality is not currently available but may be added in the future</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from promotional communications (we currently send minimal emails)</li>
                  <li><strong>Object:</strong> Object to certain processing of your data</li>
                </ul>
                <p className="text-gray-700 leading-relaxed font-medium mt-4">
                  To exercise these rights, please contact us at <a href="mailto:auroincemail@gmail.com" className="text-black hover:underline underline font-black">auroincemail@gmail.com</a>
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">7. Children&apos;s Privacy</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Our Service is not intended for children under 15 years of age. We do not knowingly collect personal information from children under 15. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:auroincemail@gmail.com" className="text-black hover:underline underline font-black">auroincemail@gmail.com</a>, and we will delete such information promptly.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <Globe className="h-6 w-6 text-black" />
                  8. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Your data is stored on Supabase servers, which may be located in various regions globally. The specific server location depends on our Supabase configuration. Your information may be transferred to and maintained on servers located outside of Egypt or your country of residence, where data protection laws may differ. By using the Service, you consent to such transfers.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">9. GDPR Compliance (EU Users)</h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-2">
                  While Auro is based in Egypt, we respect the privacy rights of users in the European Economic Area (EEA). If you are in the EEA, you have additional rights under GDPR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Right to data portability (currently not available, but may be added)</li>
                  <li>Right to restrict processing</li>
                  <li>Right to object to automated decision-making</li>
                  <li>Right to lodge a complaint with a supervisory authority</li>
                </ul>
                <p className="text-gray-700 leading-relaxed font-medium mt-4">
                  Our legal basis for processing your data includes: consent, contractual necessity, legal obligations, and legitimate interests. We strive to comply with GDPR principles even though we are not legally required to do so.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">10. CCPA Compliance (California Users)</h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-2">
                  While Auro is based in Egypt, we respect the privacy rights of California residents. If you are a California resident, you have additional rights under CCPA:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to deletion of personal information</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
                <p className="text-gray-700 leading-relaxed font-medium mt-4">
                  <strong>Important:</strong> We do not sell, rent, or trade your personal information to any third parties. We strive to comply with CCPA principles even though we are not legally required to do so.
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">11. Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">12. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &quot;Last Updated&quot; date and, for material changes, by sending an email or posting a notice on our Service. Your continued use after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Section 13 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">13. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed font-medium mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="p-4 rounded-xl bg-[#F7FF00]/20 border-2 border-black space-y-2">
                  <p className="text-black font-bold">
                    <strong>Service Name:</strong> Auro
                  </p>
                  <p className="text-black font-bold">
                    <strong>Location:</strong> Cairo, Egypt
                  </p>
                  <p className="text-black font-bold">
                    <strong>Email:</strong> <a href="mailto:auroincemail@gmail.com" className="text-black hover:underline underline">auroincemail@gmail.com</a>
                  </p>
                  <p className="text-black font-bold text-sm mt-2">
                    For privacy-related inquiries, please include &quot;Privacy Request&quot; in your email subject line.
                  </p>
                </div>
              </section>

              {/* Footer Note */}
              <div className="pt-6 border-t-2 border-black">
                <p className="text-gray-600 text-sm text-center font-medium">
                  By using Auro, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
