import type { FAQItem } from '@/types';

export const mockFAQ: FAQItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is Lordfunded?',
    answer: 'Lordfunded is a leading proprietary trading firm that provides traders with access to substantial capital. After passing our evaluation process, traders receive funded accounts ranging from $10,000 to $200,000 and keep up to 90% of their profits.',
  },
  {
    id: '2',
    category: 'General',
    question: 'How does the challenge work?',
    answer: 'Our challenge consists of two phases. In Phase 1, you must achieve an 8% profit target while respecting our risk rules. In Phase 2, you need to achieve a 5% profit target. Once both phases are complete, you receive a funded account with real capital.',
  },
  {
    id: '3',
    category: 'Trading Rules',
    question: 'What are the maximum drawdown rules?',
    answer: 'The maximum daily drawdown is 5% of your account balance, and the maximum overall drawdown is 10%. These limits are calculated based on your account balance at the start of each trading day.',
  },
  {
    id: '4',
    category: 'Trading Rules',
    question: 'Are there any trading restrictions?',
    answer: 'We allow trading on Forex, indices, commodities, and cryptocurrencies. News trading is allowed. We do not allow holding positions over the weekend for certain instruments. Expert Advisors (EAs) are permitted as long as they follow our fair usage policy.',
  },
  {
    id: '5',
    category: 'Payouts',
    question: 'How and when do I get paid?',
    answer: 'Payouts are processed within 1-2 business days upon request. You can withdraw profits on the first profitable trading day of a live account, and then every 14 days thereafter. We support USDT, bank transfers, and other payment methods.',
  },
  {
    id: '6',
    category: 'Payouts',
    question: 'What is the profit split?',
    answer: 'Our profit split ranges from 80% to 90% depending on your account size. $10K accounts receive 80%, $50K accounts receive 85%, and $100K+ accounts receive 90% of profits. There are no hidden fees.',
  },
  {
    id: '7',
    category: 'Account',
    question: 'Which trading platforms do you support?',
    answer: 'We support MetaTrader 4 (MT4) and MetaTrader 5 (MT5). You can choose your preferred platform when signing up for a challenge.',
  },
  {
    id: '8',
    category: 'Account',
    question: 'What leverage is available?',
    answer: 'We offer leverage up to 1:100 for Forex pairs and 1:50 for other instruments. The leverage is consistent across all account sizes.',
  },
  {
    id: '9',
    category: 'Account',
    question: 'Can I trade multiple accounts simultaneously?',
    answer: 'Yes, you can run multiple challenge accounts simultaneously. There are no restrictions on the number of accounts, but your total funded capital cannot exceed $400,000 per trader.',
  },
  {
    id: '10',
    category: 'Support',
    question: 'How can I contact support?',
    answer: 'Our support team is available 24/5 via live chat, email, and Discord. Premium account holders also have access to a dedicated account manager for personalized assistance.',
  },
];
