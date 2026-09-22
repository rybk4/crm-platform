import type { ReactNode } from 'react'

export type IconName =
  | 'alert'
  | 'analytics'
  | 'check'
  | 'chevron-up'
  | 'clients'
  | 'close'
  | 'journal'
  | 'logout'
  | 'menu'
  | 'offline'
  | 'plus'
  | 'refresh'
  | 'edit'
  | 'trash'
  | 'services'
  | 'specialists'

interface IconProps {
  name: IconName
  size?: number
}

function iconContent(name: IconName): ReactNode {
  switch (name) {
    case 'alert':
      return (
        <>
          <path d="M12 9v4" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 17h.01" />
        </>
      )
    case 'offline':
      return (
        <>
          <path d="M5 12.6a9 9 0 0 1 4-2.3M1 8.5a15 15 0 0 1 5-3.2M23 8.5a15 15 0 0 0-6.6-3.6M19 12.6a9 9 0 0 0-3-2" />
          <path d="M8.5 16.1a5 5 0 0 1 7 0M12 20h.01M2 2l20 20" />
        </>
      )
    case 'refresh':
      return (
        <>
          <path d="M21 12a9 9 0 1 1-2.6-6.4" />
          <path d="M21 3v6h-6" />
        </>
      )
    case 'check':
      return <path d="m5 12 4 4L19 6" />
    case 'chevron-up':
      return <path d="m18 15-6-6-6 6" />
    case 'journal':
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" />
        </>
      )
    case 'clients':
      return (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )
    case 'specialists':
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2M18 6h3M19.5 4.5v3" />
        </>
      )
    case 'services':
      return (
        <>
          <path d="M12 2 4 6v12l8 4 8-4V6l-8-4Z" />
          <path d="m4 6 8 4 8-4M12 10v12M8 4l8 4" />
        </>
      )
    case 'analytics':
      return (
        <>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </>
      )
    case 'logout':
      return (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </>
      )
    case 'close':
      return <path d="m18 6-12 12M6 6l12 12" />
    case 'menu':
      return (
        <>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </>
      )
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
    case 'edit':
      return (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      )
    case 'trash':
      return (
        <>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
        </>
      )
  }
}

export function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconContent(name)}
    </svg>
  )
}
