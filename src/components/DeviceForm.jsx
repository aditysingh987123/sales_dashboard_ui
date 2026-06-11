import { Field } from './Field'
import {
  AMD_GENERATIONS,
  AMD_PROCESSORS,
  APPLE_PROCESSORS,
  BRANDS,
  CONDITIONS,
  DEVICE_TYPES,
  INTEL_GENERATIONS,
  INTEL_PROCESSORS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
} from '../data/constants'

const emptyDevice = {
  deviceType: 'Laptop',
  condition: 'New',
  brand: 'Dell',
  processorBrand: 'Intel',
  processor: 'i5',
  generation: '13th Gen',
  ram: '16 GB',
  storage: '512 GB SSD',
  graphicCard: 'No',
  quantity: '',
  lockInMonths: '',
  pricePerMonth: '',
  excludingGst: 'Yes',
  deliveryStatus: 'ND',
}

export function createEmptyDevice() {
  return { ...emptyDevice, deviceId: `DEV-${Date.now()}` }
}

const toNumberOrBlank = (value) => (value === '' || value === null || value === undefined ? '' : Number(value))
const required = (value) => value !== '' && value !== null && value !== undefined
const nonNegative = (value) => value === '' || value === null || value === undefined || Number(value) >= 0

function getDeviceErrors(device) {
  const errors = {}

  if (!required(device.deviceType)) errors.deviceType = 'Device Type is required.'
  if (!required(device.brand)) errors.brand = 'Brand is required.'
  if (!required(device.condition)) errors.condition = 'Condition is required.'
  if (!required(device.processorBrand)) errors.processorBrand = 'Processor Brand is required.'
  if (!required(device.processor)) errors.processor = 'Processor is required.'
  if (device.brand !== 'Apple' && !required(device.generation)) errors.generation = 'Generation is required.'
  if (!required(device.ram)) errors.ram = 'RAM is required.'
  if (!required(device.storage)) errors.storage = 'Storage is required.'
  if (!required(device.graphicCard)) errors.graphicCard = 'Graphic Card is required.'
  if (!required(device.quantity)) errors.quantity = 'Quantity is required.'
  else if (!nonNegative(device.quantity)) errors.quantity = 'Quantity cannot be negative.'
  if (!required(device.lockInMonths)) errors.lockInMonths = 'Lock-in Months is required.'
  else if (!nonNegative(device.lockInMonths)) errors.lockInMonths = 'Lock-in Months cannot be negative.'
  if (!required(device.pricePerMonth)) errors.pricePerMonth = 'Price Per Month is required.'
  else if (!nonNegative(device.pricePerMonth)) errors.pricePerMonth = 'Price Per Month cannot be negative.'

  return errors
}

export function validateDevice(device) {
  return getDeviceErrors(device)
}

export default function DeviceForm({ device, onChange, onRemove, canRemove = true, disabled = false, showErrors = true }) {
  const isApple = device.brand === 'Apple'
  const isAMD = device.processorBrand === 'AMD'
  const errors = showErrors ? getDeviceErrors(device) : {}

  const set = (key, value) => {
    const next = { ...device, [key]: value }

    if (key === 'brand' && value === 'Apple') {
      next.processorBrand = 'Apple Silicon'
      next.processor = 'M2'
      next.generation = ''
    }

    if (key === 'brand' && value !== 'Apple' && device.brand === 'Apple') {
      next.processorBrand = 'Intel'
      next.processor = 'i5'
      next.generation = '13th Gen'
    }

    if (key === 'processorBrand') {
      next.processor = value === 'AMD' ? 'Ryzen 5' : 'i5'
      next.generation = value === 'AMD' ? '7000 Series' : '13th Gen'
    }

    onChange(next)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-black text-slate-900">Device Requirement</h3>
        {canRemove && (
          <button type="button" disabled={disabled} onClick={onRemove} className="btn-danger">
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Device Type *" error={errors.deviceType}>
          <select disabled={disabled} className={`form-input ${errors.deviceType ? 'input-error' : ''}`} value={device.deviceType} onChange={(e) => set('deviceType', e.target.value)}>
            {DEVICE_TYPES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Brand *" error={errors.brand}>
          <select disabled={disabled} className={`form-input ${errors.brand ? 'input-error' : ''}`} value={device.brand} onChange={(e) => set('brand', e.target.value)}>
            {BRANDS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Condition *" error={errors.condition}>
          <select disabled={disabled} className={`form-input ${errors.condition ? 'input-error' : ''}`} value={device.condition} onChange={(e) => set('condition', e.target.value)}>
            {CONDITIONS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Processor Brand *" error={errors.processorBrand}>
          <select disabled={disabled || isApple} className={`form-input ${errors.processorBrand ? 'input-error' : ''}`} value={device.processorBrand} onChange={(e) => set('processorBrand', e.target.value)}>
            {isApple ? <option>Apple Silicon</option> : ['Intel', 'AMD'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Processor *" error={errors.processor}>
          <select disabled={disabled} className={`form-input ${errors.processor ? 'input-error' : ''}`} value={device.processor} onChange={(e) => set('processor', e.target.value)}>
            {(isApple ? APPLE_PROCESSORS : isAMD ? AMD_PROCESSORS : INTEL_PROCESSORS).map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        {!isApple && (
          <Field label="Generation *" error={errors.generation}>
            <select disabled={disabled} className={`form-input ${errors.generation ? 'input-error' : ''}`} value={device.generation} onChange={(e) => set('generation', e.target.value)}>
              {(isAMD ? AMD_GENERATIONS : INTEL_GENERATIONS).map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        )}

        <Field label="RAM *" error={errors.ram}>
          <select disabled={disabled} className={`form-input ${errors.ram ? 'input-error' : ''}`} value={device.ram} onChange={(e) => set('ram', e.target.value)}>
            {RAM_OPTIONS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Storage *" error={errors.storage}>
          <select disabled={disabled} className={`form-input ${errors.storage ? 'input-error' : ''}`} value={device.storage} onChange={(e) => set('storage', e.target.value)}>
            {STORAGE_OPTIONS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Graphic Card *" error={errors.graphicCard}>
          <select disabled={disabled} className={`form-input ${errors.graphicCard ? 'input-error' : ''}`} value={device.graphicCard} onChange={(e) => set('graphicCard', e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>

        <Field label="Quantity *" error={errors.quantity}>
          <input disabled={disabled} className={`form-input ${errors.quantity ? 'input-error' : ''}`} type="number" min="0" value={device.quantity} onChange={(e) => set('quantity', toNumberOrBlank(e.target.value))} />
        </Field>

        <Field label="Lock-in Months *" error={errors.lockInMonths}>
          <input disabled={disabled} className={`form-input ${errors.lockInMonths ? 'input-error' : ''}`} type="number" min="0" value={device.lockInMonths} onChange={(e) => set('lockInMonths', toNumberOrBlank(e.target.value))} />
        </Field>

        <Field label="Price Per Month *" error={errors.pricePerMonth}>
          <input disabled={disabled} className={`form-input ${errors.pricePerMonth ? 'input-error' : ''}`} type="number" min="0" value={device.pricePerMonth} onChange={(e) => set('pricePerMonth', toNumberOrBlank(e.target.value))} />
        </Field>
      </div>
    </div>
  )
}
