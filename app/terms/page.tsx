"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { FileText, Scale, Shield } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"
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
          className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
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
              className="inline-block p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Scale className="h-12 w-12 text-purple-400" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Terms of Service
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
                {/* Section 1 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-400" />
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    By accessing and using Auro ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">2. Description of Service</h2>
                  <p className="text-white/80 leading-relaxed">
                    Auro provides a platform for users to create anonymous inboxes and receive anonymous messages from others. The Service allows users to:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li>Create multiple anonymous inboxes</li>
                    <li>Receive anonymous messages</li>
                    <li>Reply to messages publicly or privately</li>
                    <li>Share Q&A on social media platforms</li>
                    <li>Moderate and manage received content</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">3. User Eligibility</h2>
                  <p className="text-white/80 leading-relaxed">
                    You must be at least 15 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you must have permission from a parent or legal guardian.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">4. User Accounts</h2>
                  <p className="text-white/80 leading-relaxed">
                    To use certain features of the Service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your password</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">5. Prohibited Content and Conduct</h2>
                  <p className="text-white/80 leading-relaxed">
                    You agree not to use the Service to send, receive, or share content that:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
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
                  <h2 className="text-2xl font-bold text-white">6. Content Moderation</h2>
                  <p className="text-white/80 leading-relaxed">
                    We have a dedicated team of moderators who review reported content. We reserve the right to:
                  </p>
                  <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                    <li>Review content that has been flagged or reported by users</li>
                    <li>Remove content that violates these Terms</li>
                    <li>Suspend or terminate accounts for violations</li>
                    <li>Report illegal activities to law enforcement authorities</li>
                    <li>Block IP addresses or anonymous senders who violate our policies</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    <strong>User Responsibility:</strong> Users are responsible for the content they send and receive. While you can report unwanted content, you acknowledge that you use the Service at your own discretion and risk.
                  </p>
                </section>

                {/* Section 7 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">7. Anonymity and Privacy</h2>
                  <p className="text-white/80 leading-relaxed">
                    While we strive to maintain user anonymity, we cannot guarantee complete anonymity. We may collect and store certain information (such as IP addresses) for security and moderation purposes. See our Privacy Policy for more details.
                  </p>
                </section>

                {/* Section 8 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">8. Intellectual Property</h2>
                  <p className="text-white/80 leading-relaxed">
                    The Service and its original content, features, and functionality are owned by Auro and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of content you create, but grant us a license to use, display, and distribute it as necessary to provide the Service.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">9. Disclaimer of Warranties</h2>
                  <p className="text-white/80 leading-relaxed">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT GUARANTEE ANY SPECIFIC UPTIME OR AVAILABILITY. THE SERVICE MAY EXPERIENCE DOWNTIME, INTERRUPTIONS, OR DATA LOSS.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">10. Limitation of Liability</h2>
                  <p className="text-white/80 leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, AURO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">11. Termination</h2>
                  <p className="text-white/80 leading-relaxed">
                    We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                  </p>
                </section>

                {/* Section 12 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">12. Changes to Terms</h2>
                  <p className="text-white/80 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                  </p>
                </section>

                {/* Section 13 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">13. Governing Law</h2>
                  <p className="text-white/80 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Cairo, Egypt.
                  </p>
                </section>

                {/* Section 14 */}
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">14. Contact Information</h2>
                  <p className="text-white/80 leading-relaxed">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-white/80">
                      <strong>Service Name:</strong> Auro
                    </p>
                    <p className="text-white/80">
                      <strong>Location:</strong> Cairo, Egypt
                    </p>
                    <p className="text-white/80">
                      <strong>Email:</strong> <a href="mailto:auroincemail@gmail.com" className="text-purple-400 hover:text-purple-300 underline">auroincemail@gmail.com</a>
                    </p>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-white/60 text-sm text-center">
                    By using Auro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

