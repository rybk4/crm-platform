import type { ClientForm, ClientFormErrors, ClientFormField } from '../model'

export interface ClientFieldsProps {
  idPrefix: string
  form: ClientForm
  errors: ClientFormErrors
  patch: <K extends ClientFormField>(field: K, value: ClientForm[K]) => void
}
