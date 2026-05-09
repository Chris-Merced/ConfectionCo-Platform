import type { ReactElement } from "react";

export default function TermsAndConditions(): ReactElement {
  return (
    <div className="policy-page">
      <div className="policy-content">
        <h1 className="policy-title">Terms &amp; Conditions</h1>
        <p className="policy-meta">Last updated: May 8, 2025</p>

        <div className="policy-summary">
          <strong>Please read these terms carefully.</strong> By placing an order or using our services, you agree to the terms outlined below. If you have any questions, contact us at{" "}
          <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a> before ordering.
        </div>

        <section className="policy-section">
          <h2>1. About Us</h2>
          <p>
            ConfectionCo Bakery is a small artisan bakery offering handcrafted baked goods made to order. All orders are subject to availability and confirmation by ConfectionCo Bakery.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Orders &amp; Custom Items</h2>
          <p>All of our products are made to order. By placing an order you agree to the following:</p>
          <ul>
            <li>Orders are not confirmed until a deposit or full payment has been received.</li>
            <li>Custom orders (cakes, gift boxes, etc.) require advance notice — timing will be communicated at the time of inquiry.</li>
            <li>You are responsible for providing accurate order details including flavor, design, sizing, and delivery date preferences.</li>
            <li>ConfectionCo Bakery reserves the right to decline any order at our discretion.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Payments</h2>
          <p>
            Payment is processed securely through <strong>Stripe</strong>. We may require a deposit or full payment upfront depending on the order type.
          </p>
          <ul>
            <li>Payment links will be sent via SMS or email to the contact information you provide.</li>
            <li>Orders will not be fulfilled until payment is confirmed.</li>
            <li>All prices are in USD and subject to change without notice.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Cancellations &amp; Refunds</h2>
          <ul>
            <li>Cancellations made more than 72 hours before the scheduled pickup or delivery date may be eligible for a partial refund at our discretion.</li>
            <li>Cancellations made within 72 hours of the order date are non-refundable, as ingredients and preparation will have already begun.</li>
            <li>If ConfectionCo Bakery is unable to fulfill your order, you will receive a full refund.</li>
            <li>Refunds are processed through Stripe and may take 5–10 business days to appear.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. SMS Communications</h2>
          <p>
            By providing your phone number, you consent to receive SMS messages from ConfectionCo Bakery related to your order, including payment links and confirmations.
          </p>
          <ul>
            <li>Message and data rates may apply.</li>
            <li>You may opt out at any time by replying <strong>STOP</strong>.</li>
            <li>
              For assistance, reply <strong>HELP</strong> or email us at{" "}
              <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a>.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Allergens &amp; Dietary Information</h2>
          <p>
            Our products are made in a kitchen that handles common allergens including but not limited to: gluten, dairy, eggs, nuts, and soy. We cannot guarantee that any item is free from allergens. It is your responsibility to inform us of any allergies or dietary restrictions prior to placing your order. ConfectionCo Bakery is not liable for any allergic reactions resulting from consumption of our products.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Pickup &amp; Delivery</h2>
          <ul>
            <li>Pickup and delivery arrangements will be communicated at the time of order confirmation.</li>
            <li>ConfectionCo Bakery is not responsible for product quality after it has been picked up or delivered.</li>
            <li>Please inspect your order upon receipt and report any concerns immediately.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. Limitation of Liability</h2>
          <p>
            ConfectionCo Bakery's liability is limited to the total amount paid for the order in question. We are not responsible for indirect, incidental, or consequential damages arising from the use of our products or services.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to These Terms</h2>
          <p>
            We reserve the right to update these Terms &amp; Conditions at any time. Changes will be reflected on this page with an updated date. Continued use of our services after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about these Terms &amp; Conditions, please reach out:</p>
          <ul>
            <li>Email: <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a></li>
            <li>Website: confectioncobakery.com</li>
          </ul>
        </section>

        <div className="policy-footer">
          hello@confectioncobakery.com &nbsp;·&nbsp; confectioncobakery.com
        </div>
      </div>
    </div>
  );
}
