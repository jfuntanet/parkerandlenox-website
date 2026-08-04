import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  // Español sin prefijo (/faqs), inglés con prefijo (/en/faqs)
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
