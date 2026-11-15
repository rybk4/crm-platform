import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useLocale } from '@/lib/i18n/LocaleContext'
import { ToastCloseButton } from './ToastCloseButton'
import { ToastIcon } from './ToastIcon'

import './toast.css'

export function ToastProvider() {
  const { t } = useLocale()

  return (
    <ToastContainer
      className="ui-toasts"
      toastClassName="ui-toast"
      position="top-right"
      aria-label={t('notificationsLabel')}
      autoClose={4500}
      hideProgressBar
      newestOnTop
      closeOnClick={false}
      pauseOnFocusLoss
      pauseOnHover
      draggable={false}
      transition={Slide}
      closeButton={({ closeToast }) => <ToastCloseButton onClose={() => closeToast(true)} />}
      icon={ToastIcon}
      limit={3}
    />
  )
}
