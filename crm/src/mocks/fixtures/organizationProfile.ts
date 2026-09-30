import type { City, OrganizationProfile } from '@/modules/settings/types'
import { organization } from './organization'

export const cities: City[] = [
  { id: 1, name: 'Алматы' },
  { id: 2, name: 'Астана' },
  { id: 3, name: 'Шымкент' },
  { id: 4, name: 'Караганда' },
  { id: 5, name: 'Актобе' },
]

/** Картинка-заглушка без сети: градиент с подписью. */
function placeholderPhoto(from: string, to: string, caption: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="300" height="300" fill="url(#g)"/>
<text x="150" y="160" font-family="sans-serif" font-size="28" fill="white" text-anchor="middle">${caption}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const organizationProfile: OrganizationProfile = {
  id: organization.id,
  name: organization.name,
  phone: '+77273501120',
  email: 'hello@lavanda.kz',
  city: 1,
  address: 'проспект Абая, 44',
  working_days: 'Пн–Сб, 09:00–21:00',
  description: 'Студия красоты полного цикла: волосы, ногти, брови и уход за кожей.',
  avatar_url: null,
  photos: [
    { id: 1, url: placeholderPhoto('#8e6fd8', '#c9b6f5', 'Холл') },
    { id: 2, url: placeholderPhoto('#5b7fd6', '#a7c1f2', 'Зал') },
  ],
}
