export interface SpecialistCertificate {
  id?: number
  title: string
  image_url: string
  issued_at: string | null
  position: number
}

export interface WorkSchedule {
  id?: number
  weekday: number
  is_day_off: boolean
  start_time: string | null
  end_time: string | null
  break_start: string | null
  break_end: string | null
}

export interface Specialist {
  id: number
  branch: number
  branch_name: string
  organization_id: number
  organization_name: string
  first_name: string
  last_name: string
  middle_name: string
  full_name: string
  job_title: string
  phone_number: string
  photo_url: string
  bio: string
  is_active: boolean
  services_count: number
  certificates: SpecialistCertificate[]
  schedule: WorkSchedule[]
}

export type SpecialistInput = Omit<Specialist, 'id' | 'branch_name' | 'organization_id' | 'organization_name' | 'full_name' | 'services_count'>
