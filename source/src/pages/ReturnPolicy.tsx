import PolicyLayout from "@/components/PolicyLayout";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

export default function ReturnPolicy() {
  const { lang } = useLanguage();

  return (
    <PolicyLayout title={t("returnPolicy", lang)}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t("introduction", lang)}</h2>
          <p>
            This Return and Refund Policy applies to all custom manufacturing orders placed with Dongguan VEKKST Garment Co., Ltd. By placing an order, you agree to the terms outlined below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Quality Guarantee</h2>
          <p>
            We guarantee the quality of all garments manufactured in our facility. Each production batch undergoes inspection before shipping to ensure it meets the agreed specifications and quality standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Sample Orders</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Sample fees</strong> are non-refundable and must be paid in full before production begins.</li>
            <li>If the final bulk order is placed for <strong>100 pieces or more</strong>, sample fees may be credited toward the bulk order total.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Defective Goods</h2>
          <p>If you receive defective goods due to manufacturing errors, we will:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Provide a <strong>free remake</strong> of the defective items.</li>
            <li>Cover the <strong>re-shipping cost</strong> for the replacement goods.</li>
            <li>You must report defects within <strong>30 days of delivery</strong> with clear photos and a description of the issue.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Custom Orders</h2>
          <p>Because all products are <strong>custom manufactured to your specifications</strong>, we do not accept returns for:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Change of mind or buyer's remorse.</li>
            <li>Sizing issues caused by incorrect measurements provided by the customer.</li>
            <li>Color differences due to monitor or display variations.</li>
            <li>Design changes requested after production has started.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Bulk Order Disputes</h2>
          <p>
            For bulk orders, any quality issues must be reported within <strong>30 days of receipt</strong>. We may request the return of defective items for inspection before issuing a replacement or refund. Return shipping for inspection may be covered by us if the defect is confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Refund Processing</h2>
          <p>Refunds are only issued when:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>We are unable to fulfill the order due to our own production issues.</li>
            <li>The goods are confirmed defective and we cannot remake them.</li>
            <li>Refunds are processed to the original payment method within <strong>14 business days</strong> after approval.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Cancellation Policy</h2>
          <p>
            Orders may be cancelled <strong>before production begins</strong> with a full refund of the deposit. Once production has started, the deposit is non-refundable. If cancellation occurs after production is complete, the full order value is due.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p>
            If you have any questions about this Return and Refund Policy, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Dongguan VEKKST Garment Co., Ltd.</strong><br />
            2nd floor, C Block, Garment Creative Industrial Park, Humen Town, Dongguan City, Guangdong Province, China<br />
            Email: Info@vekkst.com<br />
            Phone: +86 134 2474 5515
          </p>
        </section>

        <section>
          <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </PolicyLayout>
  );
}
