import PolicyLayout from "@/components/PolicyLayout";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

export default function ShippingPolicy() {
  const { lang } = useLanguage();

  return (
    <PolicyLayout title={t("shippingPolicy", lang)}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{t("introduction", lang)}</h2>
          <p>
            This Shipping and Delivery Policy outlines how Dongguan VEKKST Garment Co., Ltd. handles production timelines, shipping methods, costs, and delivery terms for all orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Production Lead Time</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Sample orders:</strong> 7–14 business days</li>
            <li><strong>Bulk orders:</strong> 20–45 business days depending on quantity and complexity</li>
            <li><strong>Peak season (August–October):</strong> Lead times may extend by 5–10 days</li>
          </ul>
          <p className="mt-2">
            Lead times begin once the deposit is received and all design specifications, sizes, and materials are confirmed in writing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Shipping Methods</h2>
          <p>We ship worldwide using the following methods:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Express courier (DHL, FedEx, UPS):</strong> 3–7 business days</li>
            <li><strong>Air freight:</strong> 5–10 business days</li>
            <li><strong>Sea freight:</strong> 20–40 business days (recommended for large bulk orders)</li>
          </ul>
          <p className="mt-2">
            The shipping method is selected based on order size, urgency, and customer preference. Shipping costs are confirmed in the final quote before production begins.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Shipping Costs</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Sample orders:</strong> Shipping cost is paid by the customer.</li>
            <li><strong>Bulk orders:</strong> We offer DDP (Delivered Duty Paid) or FOB (Free On Board) terms based on your preference.</li>
            <li>All shipping costs are confirmed in the final quote before production starts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Customs & Import Duties</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>DDP orders:</strong> We cover import duties and taxes to the destination country.</li>
            <li><strong>FOB / EXW orders:</strong> The customer is responsible for customs clearance, duties, and taxes in the destination country.</li>
          </ul>
          <p className="mt-2">
            It is the customer's responsibility to understand and comply with local import regulations for textile goods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Order Tracking</h2>
          <p>
            Once your order is shipped, we provide a tracking number within <strong>24 hours</strong>. You can track your shipment via the courier's website or through our order tracking page. We also provide periodic updates for sea freight shipments.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Delivery Delays</h2>
          <p>While we strive to meet all deadlines, delays may occur due to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Customs clearance procedures in the destination country</li>
            <li>Courier or freight delays beyond our control</li>
            <li>Peak season shipping congestion</li>
            <li>Force majeure events (natural disasters, strikes, pandemics)</li>
          </ul>
          <p className="mt-2">
            We will communicate any delays proactively and provide revised timelines whenever possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Lost or Damaged Shipments</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>If a shipment is <strong>lost by the courier</strong>, we will file a claim and either replace the goods or refund the order value.</li>
            <li>If a shipment arrives <strong>damaged</strong>, you must report it within <strong>7 days of delivery</strong> with photos of the packaging and damaged goods.</li>
            <li>Claims must be submitted with the tracking number, delivery receipt, and photographic evidence.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Partial Shipments</h2>
          <p>
            For large orders, we may arrange partial shipments at the customer's request. Additional shipping costs for partial shipments will be discussed and agreed upon before dispatch.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p>
            If you have any questions about shipping or delivery, please contact us at:
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
