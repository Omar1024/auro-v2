"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { FileText, Scale, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TermsOfServicePage() {
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
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
            <div className="inline-block p-4 rounded-2xl bg-[#F7FF00] border-3 border-black shadow-[4px_4px_0px_0px_#000000] mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
              >
                <Scale className="h-12 w-12 text-black" />
              </motion.div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-3">
              Terms of Service
            </h1>
            
            <p className="text-gray-600 font-medium text-sm sm:text-base">
              Effective Date: To be announced upon public launch
            </p>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-black shadow-[8px_8px_0px_0px_#000000] space-y-8">
              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <FileText className="h-6 w-6 text-black" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  By accessing and using Auro (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  Auro provides a platform for users to create anonymous inboxes and receive anonymous messages from others. The Service allows users to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Create multiple anonymous inboxes</li>
                  <li>Receive anonymous messages</li>
                  <li>Reply to messages publicly or privately</li>
                  <li>Share Q&A on social media platforms</li>
                  <li>Moderate and manage received content</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">3. User Eligibility</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  You must be at least 15 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you must have permission from a parent or legal guardian.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">4. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  To use certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">5. Prohibited Content and Conduct</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  You agree not to use the Service to send, receive, or share content that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
                  <li>Contains harassment, bullying, or intimidation of any kind</li>
                  <li>Contains hate speech, discrimination, or promotes violence</li>
                  <li>Contains explicit sexual content, pornography, or NSFW (Not Safe For Work) material</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains spam, malware, or phishing attempts</li>
                  <li>Involves minors in any inappropriate way</li>
                  <li>Impersonates any person or entity</li>
                  <li>Contains threats of any nature</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">6. Content Moderation</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  We have a dedicated team of moderators who review reported content. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 font-medium">
                  <li>Review content that has been flagged or reported by users</li>
                  <li>Remove content that violates these Terms</li>
                  <li>Suspend or terminate accounts for violations</li>
                  <li>Report illegal activities to law enforcement authorities</li>
                  <li>Block IP addresses or anonymous senders who violate our policies</li>
                </ul>
                <p className="text-gray-700 leading-relaxed font-medium mt-4">
                  <strong>User Responsibility:</strong> Users are responsible for the content they send and receive. While you can report unwanted content, you acknowledge that you use the Service at your own discretion and risk.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">7. Anonymity and Privacy</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  While we strive to maintain user anonymity, we cannot guarantee complete anonymity. We may collect and store certain information (such as IP addresses) for security and moderation purposes. See our Privacy Policy for more details.
                </p>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">8. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  The Service and its original content, features, and functionality are owned by Auro and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of content you create, but grant us a license to use, display, and distribute it as necessary to provide the Service.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">9. Disclaimer of Warranties</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT GUARANTEE ANY SPECIFIC UPTIME OR AVAILABILITY. THE SERVICE MAY EXPERIENCE DOWNTIME, INTERRUPTIONS, OR DATA LOSS.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">10. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, AURO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">11. Termination</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the &quot;Last Updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Section 13 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">13. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  These Terms shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Cairo, Egypt.
                </p>
              </section>

              {/* Section 14 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-black">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                  If you have any questions about these Terms, please contact us at:
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
                </div>
              </section>

              {/* Footer Note */}
              <div className="pt-6 border-t-2 border-black">
                <p className="text-gray-600 text-sm text-center font-medium">
                  By using Auro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
