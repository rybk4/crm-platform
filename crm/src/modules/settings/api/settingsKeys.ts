export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'organization-profile'] as const,
  cities: () => [...settingsKeys.all, 'cities'] as const,
}
