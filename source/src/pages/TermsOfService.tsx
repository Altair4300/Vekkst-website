import PolicyLayout from "@/components/PolicyLayout";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

export default function TermsOfService() {
  const { lang } = useLanguage();

  return (
    <PolicyLayout title={t("termsOfService", lang)}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t("introduction", lang)}</h2>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the website and services provided by Dongguan VEKKST Garment Co., Ltd. ("we," "our," or "us"). By accessing or using our website, you agree to be bound by these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Use of Our Services</h2>
          <p>You agree to use our website and services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Use our services in any way that violates any applicable law or regulation.</li>
            <li>Engage in any activity that interferes with or disrupts our services.</li>
            <li>Attempt to gain unauthorized access to any part of our website or systems.</li>
            <li>Use our services to transmit any harmful, offensive, or illegal content.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Quote Requests and Orders</h2>
          <p>
            When you submit a quote request or place an order through our website, you agree to provide accurate and complete information. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspicion of fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the property of Dongguan VEKKST Garment Co., Ltd. or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Custom Designs and Samples</h2>
          <p>
            Any designs, logos, or artwork you provide for custom manufacturing remain your property. However, by submitting these materials, you grant us a limited license to use them solely for the purpose of manufacturing your products. You represent and warrant that you have the right to use and reproduce any materials you submit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h2>
          <p>
            Payment terms for orders are as specified in your quote or order confirmation. We accept T/T (Telegraphic Transfer), L/C (Letter of Credit), and Western Union. A 30% deposit is typically required before production begins, with the remaining 70% due before shipment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Dongguan VEKKST Garment Co., Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services. Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid for the specific products or services giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the People's Republic of China, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of Dongguan City, Guangdong Province, China.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to These Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services after any changes constitutes your acceptance of the revised Terms.
          </p>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Dongguan VEKKST Garment Co., Ltd.</strong><br />
            Email: Info@vekkst.com<br />
            Phone: +86 134 2474 5515
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
