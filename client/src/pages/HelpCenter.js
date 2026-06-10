import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CreditCard, BookOpen, User, CalendarDays, Shield } from 'lucide-react';
import StaticPageLayout from '../components/StaticPageLayout';
import { SUPPORT_EMAIL } from '../constants/support';
import { formatPremiumPrice } from '../constants/pricing';

const FAQ_ITEMS = [
  {
    icon: BookOpen,
    question: 'How do free questions work?',
    answer:
      'About 25% of questions are free and spread across the catalog. Sign in with Google to access them. Upgrade once to unlock every question, answer, and explanation.',
  },
  {
    icon: CreditCard,
    question: 'How does premium payment work?',
    answer: `Premium is a one-time payment of ${formatPremiumPrice()} processed securely through Cashfree. After payment, all premium content stays unlocked on your account.`,
  },
  {
    icon: User,
    question: 'Do I need a password?',
    answer:
      'No. Upchallenges uses Google sign-in only. Your progress, bookmarks, notes, and payment status are tied to the Google account you use.',
  },
  {
    icon: CalendarDays,
    question: 'What is the daily challenge?',
    answer:
      'Each day features one challenge question with a leaderboard. Free users get challenges from the free question pool; premium users can receive any question.',
  },
  {
    icon: Shield,
    question: 'Can I get a refund?',
    answer:
      'Digital access is delivered immediately after payment. If something went wrong with your purchase, email us within 7 days and we will review your case.',
  },
];

function FaqCard({ icon: Icon, question, answer }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{question}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{answer}</p>
        </div>
      </div>
    </article>
  );
}

export default function HelpCenter() {
  return (
    <StaticPageLayout
      title="Help Center"
      subtitle="Answers to common questions and ways to reach our team."
    >
      <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              Contact us
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Account issues, billing questions, or feedback — we typically reply within 2 business days.
            </p>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Frequently asked questions</h2>
        {FAQ_ITEMS.map((item) => (
          <FaqCard key={item.question} {...item} />
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 sm:p-6">
        <p>
          For legal terms governing use of the platform, see our{' '}
          <Link to="/terms" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </section>
    </StaticPageLayout>
  );
}
