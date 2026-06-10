import React from 'react';
import StaticPageLayout from '../components/StaticPageLayout';
import { SUPPORT_EMAIL } from '../constants/support';

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{children}</div>
    </section>
  );
}

export default function Terms() {
  const effectiveDate = 'June 8, 2026';

  return (
    <StaticPageLayout
      title="Terms & Conditions"
      subtitle={`Effective ${effectiveDate}. By using Upchallenges you agree to these terms.`}
    >
      <Section title="1. Service">
        <p>
          Upchallenges provides JavaScript practice questions, explanations, progress tracking, and related learning
          tools for personal interview preparation. We may update features or content at any time.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          You sign in with Google. You are responsible for activity on your account and for keeping access to that
          Google account secure. Do not share accounts or attempt to access another user&apos;s data.
        </p>
      </Section>

      <Section title="3. Free and premium access">
        <p>
          A portion of questions is available for free. Premium unlocks the full catalog, including answers and
          explanations. Free and premium availability may change as the product evolves.
        </p>
        <p>
          Premium is a one-time purchase tied to your account unless otherwise stated at checkout. Access remains
          associated with the Google account used to pay.
        </p>
      </Section>

      <Section title="4. Payments">
        <p>
          Payments are processed by Cashfree. We do not store full card or UPI credentials on our servers. By
          completing a purchase you also agree to Cashfree&apos;s applicable terms and privacy practices for payment
          processing.
        </p>
        <p>
          Prices are shown in INR at checkout. Taxes or fees, if applicable, will be displayed before you confirm
          payment.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>
          Use Upchallenges for lawful personal learning only. You may not scrape, bulk-download, resell, or
          redistribute question content; attempt to bypass paywalls; reverse engineer the service; or interfere with
          other users or platform security.
        </p>
      </Section>

      <Section title="6. Content and accuracy">
        <p>
          Questions and explanations are provided for educational purposes. We strive for accuracy but do not guarantee
          that content is complete, current, or suitable for every interview scenario.
        </p>
      </Section>

      <Section title="7. Disclaimer">
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. To the fullest extent permitted by
          law, Upchallenges is not liable for indirect, incidental, or consequential damages arising from use of the
          platform.
        </p>
      </Section>

      <Section title="8. Refunds">
        <p>
          Because digital access is delivered immediately, refunds are generally not automatic. If you believe a charge
          was made in error, contact{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-violet-600 hover:underline dark:text-violet-400">
            {SUPPORT_EMAIL}
          </a>{' '}
          within 7 days with your order details.
        </p>
      </Section>

      <Section title="9. Changes and contact">
        <p>
          We may revise these terms. Continued use after changes are posted constitutes acceptance of the updated terms.
          Questions about these terms:{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-violet-600 hover:underline dark:text-violet-400">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </StaticPageLayout>
  );
}
