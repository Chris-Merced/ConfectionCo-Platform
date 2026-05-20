import type { ReactElement } from "react";

export default function PrivacyPolicy(): ReactElement {
  return (
    <div className="policy-page">
      <div className="policy-content">
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-meta">Last updated: May 8, 2025</p>

        <div className="policy-summary">
          <strong>Summary:</strong> ConfectionCo Bakery collects only the information needed to process your order and communicate with you. We do not sell your data. SMS consent is never shared with third parties.
        </div>

        <section className="policy-section">
          <h2>1. Who We Are</h2>
          <p>
            ConfectionCo Bakery is a small artisan bakery specializing in handcrafted confections made to order. We can be reached at{" "}
            <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a> or through our website at confectioncobakery.com.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>When you place an order or make an inquiry, we may collect:</p>
          <ul>
            <li>Your name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Order details and preferences</li>
            <li>Payment confirmation information (processed securely through Stripe)</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Process and fulfill your order</li>
            <li>Send payment links and confirmations via SMS or email</li>
            <li>Communicate updates related to your order</li>
            <li>Respond to questions or support requests</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. SMS Messaging &amp; Consent</h2>
          <p>
            By checking the SMS opt-in checkbox on our order form, you consent to receive text messages from ConfectionCo Bakery related to your order status and updates. SMS consent is entirely optional and is not required to place or complete a purchase. Order confirmations and payment links are always sent to your email address regardless of SMS consent.
          </p>
          <ul>
            <li>Message frequency varies based on your order activity.</li>
            <li>Message and data rates may apply.</li>
            <li>You may opt out at any time by replying <strong>STOP</strong> to any message.</li>
            <li>
              For help, reply <strong>HELP</strong> or contact us at{" "}
              <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a>.
            </li>
            <li><strong>Your SMS consent and phone number will never be shared with or sold to third parties.</strong></li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Payment Processing</h2>
          <p>
            All payments are processed through <strong>Stripe</strong>, a PCI-compliant payment processor. ConfectionCo Bakery does not store your full payment card details. Please review{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">Stripe's Privacy Policy</a> for more information on how payment data is handled.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information only as necessary to fulfill your order (e.g., payment processors) or as required by law.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Data Retention</h2>
          <p>
            We retain your information only as long as necessary to fulfill your order and comply with applicable legal obligations. You may request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal information we hold about you</li>
            <li>Request correction or deletion of your information</li>
            <li>Withdraw consent for SMS communications at any time by replying STOP</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a>.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date at the top.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please reach out:</p>
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
