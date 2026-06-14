import PolicyLayout from "@/components/PolicyLayout";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

export default function PrivacyPolicy() {
  const { lang } = useLanguage();

  return (
    <PolicyLayout title={t("privacyPolicy", lang)}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t("introduction", lang)}</h2>
          <p>
            Dongguan VEKKST Garment Co., Ltd. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and shipping address when you submit a quote request or contact us.</li>
            <li><strong>Communication Data:</strong> Messages exchanged through our chat system, including text, images, and videos shared during conversations.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and device information.</li>
            <li><strong>Account Information:</strong> Login credentials and preferences for registered users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Process and respond to your quote requests and inquiries.</li>
            <li>Communicate with you about your orders, products, and services.</li>
            <li>Improve our website, products, and customer service.</li>
            <li>Send promotional materials and updates (with your consent).</li>
            <li>Comply with legal obligations and protect our rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored on secure servers with industry-standard encryption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>Request deletion of your personal data.</li>
            <li>Object to the processing of your data.</li>
            <li>Request restriction of processing.</li>
            <li>Request data portability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Dongguan VEKKST Garment Co., Ltd.</strong><br />
            2nd floor, C Block, Garment Creative Industrial Park, Humen Town, Dongguan City, Guangdong Province, China<br />
            Email: Info@vekkst.com<br />
            Phone: +86 134 2474 5515
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
