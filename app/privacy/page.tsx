"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, Database, UserCheck, Globe } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-block p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4"
              whileHover={{ scale: 1.05, rotate: -5 }}
            >
              <Shield className="h-12 w-12 text-blue-400" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Privacy Policy
            </h1>
            
            <p className="text-white/60 text-sm sm:text-base">
              Effective Date: To be announced upon public launch
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6 sm:p-8 space-y-8">
                {/* Introduction */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Eye className="h-6 w-6 text-blue-400" />
                    Introduction
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    At Auro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our anonymous messaging service. Please read this privacy policy carefully.
                  </p>
                </section>

                {/* Section 1 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Database className="h-6 w-6 text-blue-400" />
                    1. Information We Collect
                  </h2>
                  
                  <div className="space-y-4 ml-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">1.1 Personal Information</h3>
                      <p className="text-white/80 leading-relaxed mb-2">
                        When you create an account, we collect:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                        <li>Email address</li>
                        <li>Username</li>
                        <li>Password (encrypted)</li>
                        <li>Account creation date</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">1.2 Message Data</h3>
                      <p className="text-white/80 leading-relaxed mb-2">
                        We store:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                        <li>Content of messages sent and received</li>
                        <li>Timestamps of messages</li>
                        <li>Reply status (public/private)</li>
                        <li>Anonymous sender identifiers (hashed)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">1.3 Technical Information</h3>
                      <p className="text-white/80 leading-relaxed mb-2">
                        For security and moderation purposes, we collect:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                        <li>IP addresses (hashed for anonymity)</li>
                        <li>Browser type and version</li>
                        <li>Device information</li>
                        <li>Access times and dates</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">1.4 Cookies and Tracking</h3>
                      <p className="text-white/80 leading-relaxed">
                        We use essential cookies for authentication and session management. We do not currently use third-party tracking cookies or analytics services. If this changes in the future, we will update this policy and notify users.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Lock className="h-6 w-6 text-blue-400" />
                    2. How We Use Your Information
                  </h2>
                  <p className="text-white/80 leading-relaxed mb-2">
                    We use the collected information to:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
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
                  <h2 className="text-2xl font-bold text-white">3. Anonymity and Data Protection</h2>
                  <div className="space-y-4 ml-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">3.1 Anonymous Messaging</h3>
                      <p className="text-white/80 leading-relaxed">
                        When you send an anonymous message, we do not reveal your identity to the recipient. However, we store a hashed version of your IP address for moderation and abuse prevention purposes.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">3.2 Data Security</h3>
                      <p className="text-white/80 leading-relaxed">
                        We implement industry-standard security measures to protect your data, including:
                      </p>
                      <ul className="list-disc list-inside text-white/80 space-y-2 ml-4 mt-2">
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
                  <h2 className="text-2xl font-bold text-white">4. Data Sharing and Disclosure</h2>
                  <p className="text-white/80 leading-relaxed mb-2">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                    <li><strong>Safety and Security:</strong> To protect against fraud, abuse, or threats to safety</li>
                    <li><strong>Service Providers:</strong> With trusted service providers who assist in operating our service (e.g., hosting providers) under strict confidentiality agreements</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">5. Data Retention</h2>
                  <p className="text-white/80 leading-relaxed">
                    We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time. After deletion:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Permanently deleted immediately upon request</li>
                    <li><strong>Messages:</strong> Stored indefinitely unless deleted by the inbox owner</li>
                    <li><strong>Deleted Content:</strong> Removed from our active database immediately, but may persist in backups for up to 30 days</li>
                    <li><strong>IP Hashes:</strong> Retained for security and moderation purposes for 90 days after last activity</li>
                    <li>We may retain certain information for legal compliance or security purposes as required by law</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    <strong>Note:</strong> When you delete your account, all your data is permanently removed from our systems. This action cannot be undone.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-blue-400" />
                    6. Your Rights and Choices
                  </h2>
                  <p className="text-white/80 leading-relaxed mb-2">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and all associated data (permanent and irreversible)</li>
                    <li><strong>Export:</strong> Data export functionality is not currently available but may be added in the future</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from promotional communications (we currently send minimal emails)</li>
                    <li><strong>Object:</strong> Object to certain processing of your data</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    To exercise these rights, please contact us at <a href="mailto:auroincemail@gmail.com" className="text-blue-400 hover:text-blue-300 underline">auroincemail@gmail.com</a>
                  </p>
                </section>

                {/* Section 7 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">7. Children's Privacy</h2>
                  <p className="text-white/80 leading-relaxed">
                    Our Service is not intended for children under 15 years of age. We do not knowingly collect personal information from children under 15. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:auroincemail@gmail.com" className="text-blue-400 hover:text-blue-300 underline">auroincemail@gmail.com</a>, and we will delete such information promptly.
                  </p>
                </section>

                {/* Section 8 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-400" />
                    8. International Data Transfers
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    Your data is stored on Supabase servers, which may be located in various regions globally. The specific server location depends on our Supabase configuration. Your information may be transferred to and maintained on servers located outside of Egypt or your country of residence, where data protection laws may differ. By using the Service, you consent to such transfers.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">9. GDPR Compliance (EU Users)</h2>
                  <p className="text-white/80 leading-relaxed mb-2">
                    While Auro is based in Egypt, we respect the privacy rights of users in the European Economic Area (EEA). If you are in the EEA, you have additional rights under GDPR:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li>Right to data portability (currently not available, but may be added)</li>
                    <li>Right to restrict processing</li>
                    <li>Right to object to automated decision-making</li>
                    <li>Right to lodge a complaint with a supervisory authority</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    Our legal basis for processing your data includes: consent, contractual necessity, legal obligations, and legitimate interests. We strive to comply with GDPR principles even though we are not legally required to do so.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">10. CCPA Compliance (California Users)</h2>
                  <p className="text-white/80 leading-relaxed mb-2">
                    While Auro is based in Egypt, we respect the privacy rights of California residents. If you are a California resident, you have additional rights under CCPA:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to know if personal information is sold or disclosed</li>
                    <li>Right to opt-out of the sale of personal information</li>
                    <li>Right to deletion of personal information</li>
                    <li>Right to non-discrimination for exercising your rights</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    <strong>Important:</strong> We do not sell, rent, or trade your personal information to any third parties. We strive to comply with CCPA principles even though we are not legally required to do so.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">11. Third-Party Links</h2>
                  <p className="text-white/80 leading-relaxed">
                    Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                  </p>
                </section>

                {/* Section 12 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">12. Changes to This Privacy Policy</h2>
                  <p className="text-white/80 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date and, for material changes, by sending an email or posting a notice on our Service. Your continued use after changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                {/* Section 13 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">13. Contact Us</h2>
                  <p className="text-white/80 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-white/80">
                      <strong>Service Name:</strong> Auro
                    </p>
                    <p className="text-white/80">
                      <strong>Location:</strong> Cairo, Egypt
                    </p>
                    <p className="text-white/80">
                      <strong>Email:</strong> <a href="mailto:auroincemail@gmail.com" className="text-blue-400 hover:text-blue-300 underline">auroincemail@gmail.com</a>
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      For privacy-related inquiries, please include "Privacy Request" in your email subject line.
                    </p>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm text-center">
                    By using Auro, you acknowledge that you have read and understood this Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

