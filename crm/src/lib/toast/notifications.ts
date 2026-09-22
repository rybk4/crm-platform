import { toast } from 'react-toastify'

export const notifications = {
  error(message: string) {
    toast.error(message)
  },
  info(message: string) {
    toast.info(message)
  },
  success(message: string) {
    toast.success(message)
  },
}
