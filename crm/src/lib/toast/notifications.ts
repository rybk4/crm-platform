import { toast } from 'react-toastify'

export const notifications = {
  error(message: string) {
    toast.error(message, { toastId: `error:${message}`, autoClose: 6500 })
  },
  info(message: string) {
    toast.info(message, { toastId: `info:${message}` })
  },
  success(message: string) {
    toast.success(message, { toastId: `success:${message}` })
  },
}
