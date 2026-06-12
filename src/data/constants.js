export const BUSINESS_OPPORTUNITIES = [
  { code: 'L', label: 'Leasing' },
  { code: 'R', label: 'Renting' },
  { code: 'H', label: 'Hybrid' },
  { code: 'UNKNOWN', label: 'Contact person is not a decision maker' },
]

export const POTENTIAL_OPTIONS = [
  { code: 'IMMEDIATE', label: 'Yes, Immediate opportunity' },
  { code: 'FUTURE', label: 'Yes, future potentials' },
  { code: 'NO', label: 'No, Business for C Prompt' },
]

export const ORDER_STATUSES = ['Pending', 'Complete']

export const DELIVERY_STATUSES = [
  { code: 'ND', label: 'Not Delivered' },
  { code: 'PD', label: 'Partial Delivered' },
  { code: 'D', label: 'Delivered' },
]

export const TRACKING_STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Closed']
export const MAIN_STATUSES = ['Prospecting', 'Negotiation', 'Won', 'Lost']
export const APPROVAL_STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Rejected']

export const TIME_FOR_FIRST_ORDER = [
  'Less than 1 week from today',
  'Less than 2 weeks from today',
  'Less than 3 weeks from today',
  'Less than 4 weeks from today',
  'Less than 2 months from today',
  'Less than 3 months from today',
  'Less than 4 months from today',
  'Less than 5 months from today',
  'Less than 6 months from today',
]

export const NO_POTENTIAL_REASONS = [
  'Company Buy',
  'No Requirement',
  "C Prompt does not offer the product",
  'Price mismatch',
  'Others',
]

export const YEAR_OPTIONS = Array.from({ length: 2026 - 1990 + 1 }, (_, index) => String(1990 + index))

export const DEVICE_TYPES = ['Laptop', 'Desktop', 'Workstation', 'Tablet', 'iPad', 'Monitor', 'Printer', 'Other']
export const BRANDS = ['Dell', 'Lenovo', 'HP', 'Apple', 'Microsoft', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Other']
export const APPLE_PROCESSORS = ['M1', 'M1 Pro', 'M1 Max', 'M2', 'M2 Pro', 'M2 Max', 'M3', 'M3 Pro', 'M3 Max', 'M4', 'M4 Pro', 'M4 Max']
export const INTEL_PROCESSORS = ['i3', 'i5', 'i7', 'i9', 'Ultra 5', 'Ultra 7', 'Ultra 9']
export const AMD_PROCESSORS = ['Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9']
export const INTEL_GENERATIONS = ['8th Gen', '9th Gen', '10th Gen', '11th Gen', '12th Gen', '13th Gen', '14th Gen']
export const AMD_GENERATIONS = ['4000 Series', '5000 Series', '7000 Series', '8000 Series']
export const RAM_OPTIONS = ['8 GB', '16 GB', '24 GB', '32 GB', '48 GB', '64 GB', '128 GB']
export const STORAGE_OPTIONS = ['128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', '4 TB SSD']
export const CONDITIONS = ['New', 'Old Without Warranty', 'Old With Warranty']
