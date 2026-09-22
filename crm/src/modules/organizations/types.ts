export interface Organization {
  id: number
  name: string
  slug: string
  currency: string
  role: 'owner' | 'admin' | 'manager'
  branches_count: number
}

export interface Branch {
  id: number
  organization: number
  organization_name: string
  name: string
  address: string
  phone: string
  is_active: boolean
  specialists_count: number
}
