import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/mood', '/chat', '/profile'],
      },
    ],
    sitemap: 'https://www.insomnia.nu/sitemap.xml',
    host: 'https://www.insomnia.nu',
  }
}
