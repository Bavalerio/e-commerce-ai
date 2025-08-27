import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    // You can provide formats, now, timeZone, etc. here
    timeZone: 'America/New_York',
    now: new Date(),
    formats: {
      number: {
        currency: {
          style: 'currency',
          currency: locale === 'es' ? 'USD' : 'USD', // Can be configured per locale
        }
      },
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      }
    }
  };
});