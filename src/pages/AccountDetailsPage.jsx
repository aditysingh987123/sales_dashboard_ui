<<<<<<< HEAD
import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Laptop, Plus, Save, Trash2 } from 'lucide-react'
import { Field } from '../components/Field'
=======
import { useEffect, useMemo, useRef, useState } from 'react'
import React from "react";

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, ClipboardList, Eye, Plus, Route, Save, Smartphone } from 'lucide-react'
import Badge from '../components/Badge'
import { Field, InfoField } from '../components/Field'
>>>>>>> ab2da884ec55b17eb8706b3e88f527c4bd3e1324
import DeviceForm, { createEmptyDevice, validateDevice } from '../components/DeviceForm'
import {
  BUSINESS_OPPORTUNITIES,
  NO_POTENTIAL_REASONS,
  POTENTIAL_OPTIONS,
  YEAR_OPTIONS,
} from '../data/constants'

const toNumberOrBlank = (value) => (value === '' || value === null || value === undefined ? '' : Number(value))
const nonNegativeOrBlank = (value) => value === '' || value === null || value === undefined || Number(value) >= 0
const validYearOrBlank = (value) => value === '' || value === null || value === undefined || YEAR_OPTIONS.includes(String(value))


const FIELD_LABELS = {
  companyName: 'Company Name',
  contactPerson: 'Contact Person',
  mobile: 'Mobile',
  email: 'Email',
  city: 'City',
  referredBy: 'Referred By',
  businessOpportunityWeHave: 'Business Opportunity for C Prompt',
  saveriskAvailable: 'Is the data available in Saverisk?',
  unknownContactName: 'Decision Maker Name',
  unknownContactDesignation: 'Decision Maker Designation',
  unknownContactPhone: 'Decision Maker Phone',
  unknownContactEmail: 'Decision Maker Email',
  hasPotential: 'Business Potential for C Prompt',
  timeForFirstOrder: 'Time for First Order',
  expectedQtyFirstOrder: 'Expected Qty First Order',
  expectedQty3Months: 'Expected Qty 3 Months',
  expectedQty6Months: 'Expected Qty 6 Months',
  expectedQty9Months: 'Expected Qty 9 Months',
  expectedQty12Months: 'Expected Qty 12 Months',
  futurePotentialMonths: 'Future Potential Month',
  noPotentialReason: 'No Potential Reason',
  shownLeaseVsBuyCalculator: 'Shown Lease vs Buy Calculator',
  wantedProduct: 'What They Want',
  mismatchPriceAmount: 'Mismatch Price Amount',
  mismatchReason: 'Mismatch Reason',
  otherReason: 'Other Reason',
  meetingLocation: 'Live Precise Location',
  meetingType: 'Meeting Type',
  meetingPhoto: 'Meeting Proof Image',
  devices: 'Products',
  deviceType: 'Device Type',
  brand: 'Brand',
  condition: 'Condition',
  processorBrand: 'Processor Brand',
  processor: 'Processor',
  generation: 'Generation',
  ram: 'RAM',
  storage: 'Storage',
  graphicCard: 'Graphic Card',
  quantity: 'Quantity',
  lockInMonths: 'Lock-in Months',
  pricePerMonth: 'Price Per Month',
  excludingGst: 'Excluding GST',
  deliveryStatus: 'Delivery Status',
  'companyDetails.headquarterLocation': 'Headquarter Location',
  'companyDetails.revenueTwoYearsBefore': 'Revenue 2 Years Before',
  'companyDetails.previousYearRevenue': 'Previous Year Revenue',
  'companyDetails.latestRevenueCrore': 'Latest Revenue',
  'companyDetails.latestRevenueYear': 'Latest Revenue Year',
  'companyDetails.latestInvestment': 'Latest Investment',
  'companyDetails.latestInvestmentYear': 'Latest Investment Year',
  'companyDetails.investmentTakenFrom': 'Investment Taken From',
  'companyDetails.yearOfEstablishment': 'Year of Establishment',
  'companyDetails.currentEmployees': 'Current Employees',
  'companyDetails.employeesSixMonthsBefore': 'Employees 6 Months Before',
  'companyDetails.legalCases': 'No. of Legal Cases',
  'companyDetails.highRiskLegalCases': 'No. of High Risk Legal Cases',
  'companyDetails.highRiskCasesResponded': 'High Risk Cases Responded',
}

function readableFieldName(key = '') {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return String(key)
    .replace(/^companyDetails\./, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
}

function ErrorSummary({ errors, title = 'Please complete these missing / incorrect fields:' }) {
  const entries = Object.entries(errors || {}).filter(([, message]) => message)
  if (!entries.length) return null

  return (
    <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-black">{title}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map(([key, message]) => (
          <li key={key} className="rounded-2xl bg-white/70 px-3 py-2 font-bold">
            <span className="text-red-950">{readableFieldName(key)}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function OptionGrid({ value, onChange, options, error, disabled = false }) {
  return (
    <div>
      <div className={`oval-option-grid ${error ? 'oval-error' : ''}`}>
        {options.map((option) => (
          <button
            key={option.code || option}
            type="button"
            disabled={disabled}
            className={`oval-option ${value === (option.code || option) ? 'active' : ''}`}
            onClick={() => onChange(option.code || option)}
          >
            {option.label || option}
          </button>
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

function getDriveFileId(url = '') {
  const value = String(url || '').trim()
  if (!value || value.startsWith('data:image')) return ''
  const fileMatch = value.match(/\/file\/d\/([^/]+)/)
  if (fileMatch?.[1]) return fileMatch[1]
  const idMatch = value.match(/[?&]id=([^&]+)/)
  if (idMatch?.[1]) return idMatch[1]
  return ''
}

function getDisplayImageSources(url = '') {
  const value = String(url || '').trim()
  if (!value) return []
  if (value.startsWith('data:image')) return [value]
  const fileId = getDriveFileId(value)
  if (!fileId) return [value]
  return [
    `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    value,
  ]
}

function MeetingPhoto({ url }) {
  const sources = getDisplayImageSources(url)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  if (!sources.length || failed) return null
  return (
    <div className="meeting-photo-wrap">
      <div className="meeting-photo-title">Meeting proof image</div>
      <img
        src={sources[sourceIndex]}
        alt="Meeting proof"
        className="meeting-photo-img"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (sourceIndex < sources.length - 1) setSourceIndex((current) => current + 1)
          else setFailed(true)
        }}
      />
    </div>
  )
}

export default function AccountDetailsPage({ accounts, onUpdate }) {
  const { id } = useParams()
  const nav = useNavigate()
  const existing = accounts.find((item) => item.accountId === id)
  const [account, setAccount] = useState(existing)
  const [step, setStep] = useState('menu')
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [draftDevice, setDraftDevice] = useState(null)
  const [editingDeviceIndex, setEditingDeviceIndex] = useState(null)
  const [deviceError, setDeviceError] = useState('')
  const [deviceErrors, setDeviceErrors] = useState({})

  const frozen = account ? account.isFrozen || ['Won', 'Lost'].includes(account.mainStatus) : false

  const netEmployees = useMemo(() => {
    const current = account?.companyDetails?.currentEmployees ?? ''
    const previous = account?.companyDetails?.employeesSixMonthsBefore ?? ''
    if (current === '' || previous === '') return ''
    return Number(current) - Number(previous)
  }, [account?.companyDetails?.currentEmployees, account?.companyDetails?.employeesSixMonthsBefore])

  const netRevenue = useMemo(() => {
    if ((account?.companyDetails?.latestRevenueCrore ?? '') === '' && (account?.companyDetails?.previousYearRevenue ?? '') === '') return ''
    return Number(account?.companyDetails?.latestRevenueCrore || 0) - Number(account?.companyDetails?.previousYearRevenue || 0)
  }, [account?.companyDetails?.latestRevenueCrore, account?.companyDetails?.previousYearRevenue])

  if (!existing || !account) {
    return (
      <main className="p-6">
        <div className="card">
          Account not found. <Link className="font-bold text-brand-700" to="/accounts">Go back</Link>
        </div>
      </main>
    )
  }

  const set = (key, value) => {
    setAccount((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const setCD = (key, value) => {
    setAccount((prev) => ({ ...prev, companyDetails: { ...prev.companyDetails, [key]: value } }))
    setErrors((prev) => ({ ...prev, [`companyDetails.${key}`]: '' }))
  }

  const setDevices = (devices) => setAccount((prev) => ({ ...prev, devices }))

  const validateBasicDetails = () => {
    const nextErrors = {}
    if (!String(account.companyName || '').trim()) nextErrors.companyName = 'Company Name is required.'
    if (!String(account.contactPerson || '').trim()) nextErrors.contactPerson = 'Contact Person is required.'
    if (!String(account.mobile || '').trim()) nextErrors.mobile = 'Mobile is required.'
    if (!String(account.email || '').trim()) nextErrors.email = 'Email is required.'
    if (!String(account.city || '').trim()) nextErrors.city = 'City is required.'
    if (!String(account.referredBy || '').trim()) nextErrors.referredBy = 'Referred By is required.'
    if (!String(account.companyDetails?.headquarterLocation || '').trim()) nextErrors['companyDetails.headquarterLocation'] = 'Headquarter Location is required.'
    if (!account.businessOpportunityWeHave) nextErrors.businessOpportunityWeHave = 'Business Opportunity for C Prompt is required.'
    if (!account.saveriskAvailable) nextErrors.saveriskAvailable = 'Select whether data is available in Saverisk.'
    if (account.businessOpportunityWeHave === 'UNKNOWN') {
      if (!String(account.unknownContactName || '').trim()) nextErrors.unknownContactName = 'Decision maker name is required.'
      if (!String(account.unknownContactDesignation || '').trim()) nextErrors.unknownContactDesignation = 'Decision maker designation is required.'
      if (!String(account.unknownContactPhone || '').trim()) nextErrors.unknownContactPhone = 'Decision maker phone is required.'
      if (!String(account.unknownContactEmail || '').trim()) nextErrors.unknownContactEmail = 'Decision maker email is required.'
    }
    return nextErrors
  }

  const validateOpportunityDetails = () => {
    const nextErrors = {}
    if (!account.hasPotential) nextErrors.hasPotential = 'Select business potential for C Prompt.'
    if (account.hasPotential === 'IMMEDIATE') {
      if (!account.timeForFirstOrder) nextErrors.timeForFirstOrder = 'Time for First Order is required.'
      ;['expectedQtyFirstOrder', 'expectedQty3Months', 'expectedQty6Months', 'expectedQty9Months', 'expectedQty12Months'].forEach((key) => {
        if (account[key] === '') nextErrors[key] = 'This field is required.'
        else if (!nonNegativeOrBlank(account[key])) nextErrors[key] = 'Value cannot be negative.'
      })
    }
    if (account.hasPotential === 'FUTURE' && !account.futurePotentialMonths) nextErrors.futurePotentialMonths = 'Future potential month is required.'
    if (account.hasPotential === 'NO') {
      if (!account.noPotentialReason) nextErrors.noPotentialReason = 'Reason is required.'
      if (account.noPotentialReason === 'Company Buy' && !account.shownLeaseVsBuyCalculator) nextErrors.shownLeaseVsBuyCalculator = 'Select Yes or No.'
      if (account.noPotentialReason === 'C Prompt does not offer the product' && !String(account.wantedProduct || '').trim()) nextErrors.wantedProduct = 'Enter what they want.'
      if (account.noPotentialReason === 'Price mismatch') {
        if (account.mismatchPriceAmount === '') nextErrors.mismatchPriceAmount = 'Mismatch price amount is required.'
        else if (!nonNegativeOrBlank(account.mismatchPriceAmount)) nextErrors.mismatchPriceAmount = 'Amount cannot be negative.'
        if (String(account.mismatchReason || '').trim().length < 25) nextErrors.mismatchReason = 'Mismatch reason must be minimum 25 characters.'
      }
      if (account.noPotentialReason === 'Others' && !String(account.otherReason || '').trim()) nextErrors.otherReason = 'Other reason is required.'
    }
    return nextErrors
  }

  const validateRevenueDetails = () => {
    const cd = account.companyDetails || {}
    const nextErrors = {}
    if (cd.revenueTwoYearsBefore === '') nextErrors['companyDetails.revenueTwoYearsBefore'] = 'Revenue 2 Years Before is required.'
    else if (!nonNegativeOrBlank(cd.revenueTwoYearsBefore)) nextErrors['companyDetails.revenueTwoYearsBefore'] = 'Revenue cannot be negative.'
    if (cd.previousYearRevenue === '') nextErrors['companyDetails.previousYearRevenue'] = 'Previous Year Revenue is required.'
    else if (!nonNegativeOrBlank(cd.previousYearRevenue)) nextErrors['companyDetails.previousYearRevenue'] = 'Revenue cannot be negative.'
    if (cd.latestRevenueCrore === '') nextErrors['companyDetails.latestRevenueCrore'] = 'Latest Revenue is required.'
    else if (!nonNegativeOrBlank(cd.latestRevenueCrore)) nextErrors['companyDetails.latestRevenueCrore'] = 'Revenue cannot be negative.'
    if (!cd.latestRevenueYear) nextErrors['companyDetails.latestRevenueYear'] = 'Latest Revenue Year is required.'
    else if (!validYearOrBlank(cd.latestRevenueYear)) nextErrors['companyDetails.latestRevenueYear'] = 'Select a year between 1990 and 2026.'
    if (!String(cd.latestInvestment || '').trim()) nextErrors['companyDetails.latestInvestment'] = 'Latest Investment is required.'
    if (!cd.latestInvestmentYear) nextErrors['companyDetails.latestInvestmentYear'] = 'Latest Investment Year is required.'
    else if (!validYearOrBlank(cd.latestInvestmentYear)) nextErrors['companyDetails.latestInvestmentYear'] = 'Select a year between 1990 and 2026.'
    if (!String(cd.investmentTakenFrom || '').trim()) nextErrors['companyDetails.investmentTakenFrom'] = 'Investment Taken From is required.'
    return nextErrors
  }

  const validateEmployeeDetails = () => {
    const cd = account.companyDetails || {}
    const nextErrors = {}
    if (!cd.yearOfEstablishment) nextErrors['companyDetails.yearOfEstablishment'] = 'Year of Establishment is required.'
    else if (!validYearOrBlank(cd.yearOfEstablishment)) nextErrors['companyDetails.yearOfEstablishment'] = 'Select a year between 1990 and 2026.'
    if (cd.currentEmployees === '') nextErrors['companyDetails.currentEmployees'] = 'Current Employees is required.'
    else if (!nonNegativeOrBlank(cd.currentEmployees)) nextErrors['companyDetails.currentEmployees'] = 'Current Employees cannot be negative.'
    if (cd.employeesSixMonthsBefore === '') nextErrors['companyDetails.employeesSixMonthsBefore'] = 'Employees 6 Months Before is required.'
    else if (!nonNegativeOrBlank(cd.employeesSixMonthsBefore)) nextErrors['companyDetails.employeesSixMonthsBefore'] = 'Employees cannot be negative.'
    if (cd.legalCases === '') nextErrors['companyDetails.legalCases'] = 'No. of Legal Cases is required.'
    else if (!nonNegativeOrBlank(cd.legalCases)) nextErrors['companyDetails.legalCases'] = 'Legal Cases cannot be negative.'
    if (cd.highRiskLegalCases === '') nextErrors['companyDetails.highRiskLegalCases'] = 'No. of High Risk Legal Cases is required.'
    else if (!nonNegativeOrBlank(cd.highRiskLegalCases)) nextErrors['companyDetails.highRiskLegalCases'] = 'High Risk Legal Cases cannot be negative.'
    if (Number(cd.highRiskLegalCases || 0) > 0 && cd.highRiskCasesResponded === '') nextErrors['companyDetails.highRiskCasesResponded'] = 'High Risk Cases Responded is required.'
    return nextErrors
  }

  const validateProducts = () => {
    const hasInvalidDevice = (account.devices || []).some((device) => Object.keys(validateDevice(device)).length > 0)
    return hasInvalidDevice ? { devices: 'Please correct product field errors before saving.' } : {}
  }

  const saveToSheet = async (nextStep = 'menu') => {
    setSaving(true)
    setPageError('')
    try {
      await onUpdate({
        ...account,
        companyDetails: {
          ...account.companyDetails,
          netEmployeesLastSixMonths: netEmployees,
          netRevenueIncreaseFromLastYear: netRevenue,
        },
      })
      setStep(nextStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setPageError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveSectionAndReturn = async (validator, message) => {
    const nextErrors = validator()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setPageError(message || 'Please fill all mandatory fields before saving this section.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    await saveToSheet('menu')
  }

  const validateAll = () => {
    const nextErrors = { ...validateBasicDetails(), ...validateOpportunityDetails(), ...validateProducts() }
    if (account.saveriskAvailable === 'Yes') Object.assign(nextErrors, validateRevenueDetails(), validateEmployeeDetails())
    return nextErrors
  }

  const submitAndClose = async () => {
    const nextErrors = validateAll()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setPageError('Please correct the specific missing / incorrect fields shown below before submitting changes.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    await saveToSheet('menu')
    nav('/accounts')
  }

  const openProductForm = (index = null) => {
    setEditingDeviceIndex(index)
    setDraftDevice(index === null ? createEmptyDevice() : { ...(account.devices || [])[index] })
    setProductFormOpen(true)
    setDeviceError('')
    setDeviceErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveProductDetails = async () => {
    const deviceErrors = validateDevice(draftDevice || {})
    if (Object.keys(deviceErrors).length > 0) {
      setDeviceErrors(deviceErrors)
      setDeviceError('Please correct the specific missing / incorrect product fields shown below.')
      return
    }
    const devices = [...(account.devices || [])]
    if (editingDeviceIndex === null) devices.push(draftDevice)
    else devices[editingDeviceIndex] = draftDevice
    setAccount((prev) => ({ ...prev, devices }))
    setProductFormOpen(false)
    setDraftDevice(null)
    setEditingDeviceIndex(null)
    setDeviceError('')
    setDeviceErrors({})
    window.setTimeout(() => saveToSheet('menu'), 0)
  }

  const menuSections = [
    ['basic', 'Company Basic Details'],
    ['opportunity', 'Business Opportunity'],
    ...(account.saveriskAvailable === 'Yes'
      ? [
          ['revenue', 'Company Revenue Details'],
          ['employees', 'Company Employee Details'],
        ]
      : []),
    ['devices', 'Products'],
  ]

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/accounts" className="mb-3 inline-flex items-center gap-2 text-sm font-black text-brand-700"><ArrowLeft size={16} /> Back</Link>
          <h1 className="text-3xl font-black">View / Edit Account</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Open one section, save it, and return to the button screen.</p>
        </div>
      </div>

      {pageError ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{pageError}</p> : null}
      <ErrorSummary errors={errors} />
      <datalist id="year-options">{YEAR_OPTIONS.map((year) => <option key={year} value={year} />)}</datalist>

      {step === 'menu' && (
        <section className="card section-menu-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">What do you want to update?</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Location and meeting proof are locked in edit mode.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-600">Meeting address</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{account.meetingAddress || account.meetingAddressNote || 'Meeting address not available'}</p>
            </div>
            <MeetingPhoto url={account.meetingPhotoUrl} />
          </div>
          <div className="section-button-nav section-menu-buttons mt-5">
            {menuSections.map(([key, label]) => <button key={key} type="button" onClick={() => { setStep(key); setPageError('') }}>{label}</button>)}
          </div>
          <div className="section-save-row">
            <button type="button" className="btn-primary" onClick={submitAndClose} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Submit Changes'}
            </button>
          </div>
        </section>
      )}

      {step === 'basic' && (
        <section className="card">
          <h2 className="section-title">Company Basic Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Company Name *" error={errors.companyName}><input disabled={frozen} className={`form-input ${errors.companyName ? 'input-error' : ''}`} value={account.companyName || ''} onChange={(e) => set('companyName', e.target.value)} /></Field>
            <Field label="Contact Person *" error={errors.contactPerson}><input disabled={frozen} className={`form-input ${errors.contactPerson ? 'input-error' : ''}`} value={account.contactPerson || ''} onChange={(e) => set('contactPerson', e.target.value)} /></Field>
            <Field label="Mobile *" error={errors.mobile}><input disabled={frozen} className={`form-input ${errors.mobile ? 'input-error' : ''}`} value={account.mobile || ''} onChange={(e) => set('mobile', e.target.value)} /></Field>
            <Field label="Email *" error={errors.email}><input disabled={frozen} className={`form-input ${errors.email ? 'input-error' : ''}`} value={account.email || ''} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="City *" error={errors.city}><input disabled={frozen} className={`form-input ${errors.city ? 'input-error' : ''}`} value={account.city || ''} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field label="Referred By *" error={errors.referredBy}><input disabled={frozen} className={`form-input ${errors.referredBy ? 'input-error' : ''}`} value={account.referredBy || ''} onChange={(e) => set('referredBy', e.target.value)} /></Field>
            <Field label="Headquarter Location *" error={errors['companyDetails.headquarterLocation']}><input disabled={frozen} className={`form-input ${errors['companyDetails.headquarterLocation'] ? 'input-error' : ''}`} value={account.companyDetails?.headquarterLocation || ''} onChange={(e) => setCD('headquarterLocation', e.target.value)} /></Field>
          </div>
          <div className="mt-5">
            <Field label="Business Opportunity for C Prompt *" error={errors.businessOpportunityWeHave}>
              <OptionGrid disabled={frozen} value={account.businessOpportunityWeHave || ''} error={errors.businessOpportunityWeHave} onChange={(value) => set('businessOpportunityWeHave', value)} options={BUSINESS_OPPORTUNITIES.map((item) => item.code === 'UNKNOWN' ? { ...item, label: `${account.contactPerson || 'Contact Person'} is not a decision maker` } : item)} />
            </Field>
          </div>
          {account.businessOpportunityWeHave === 'UNKNOWN' ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Name *" error={errors.unknownContactName}><input disabled={frozen} className={`form-input ${errors.unknownContactName ? 'input-error' : ''}`} value={account.unknownContactName || ''} onChange={(e) => set('unknownContactName', e.target.value)} /></Field>
              <Field label="Designation *" error={errors.unknownContactDesignation}><input disabled={frozen} className={`form-input ${errors.unknownContactDesignation ? 'input-error' : ''}`} value={account.unknownContactDesignation || ''} onChange={(e) => set('unknownContactDesignation', e.target.value)} /></Field>
              <Field label="Phone No *" error={errors.unknownContactPhone}><input disabled={frozen} className={`form-input ${errors.unknownContactPhone ? 'input-error' : ''}`} value={account.unknownContactPhone || ''} onChange={(e) => set('unknownContactPhone', e.target.value)} /></Field>
              <Field label="Email *" error={errors.unknownContactEmail}><input disabled={frozen} className={`form-input ${errors.unknownContactEmail ? 'input-error' : ''}`} value={account.unknownContactEmail || ''} onChange={(e) => set('unknownContactEmail', e.target.value)} /></Field>
            </div>
          ) : null}
          <div className="mt-5">
            <Field label="Is the data available in Saverisk? *" error={errors.saveriskAvailable}>
              <OptionGrid disabled={frozen} value={account.saveriskAvailable || ''} error={errors.saveriskAvailable} onChange={(value) => set('saveriskAvailable', value)} options={['Yes', 'No']} />
            </Field>
          </div>
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateBasicDetails, 'Please fill all mandatory company basic details before saving.')} disabled={saving || frozen}>Save Details</button></div>
        </section>
      )}

      {step === 'opportunity' && (
        <section className="card">
          <h2 className="section-title">What is the business potentials for C Prompt?</h2>
          <div className="mt-4"><OptionGrid disabled={frozen} value={account.hasPotential || ''} error={errors.hasPotential} onChange={(value) => { set('hasPotential', value); if (value === 'IMMEDIATE' && !account.timeForFirstOrder) set('timeForFirstOrder', 'Within 1 month') }} options={POTENTIAL_OPTIONS} /></div>
          {account.hasPotential === 'IMMEDIATE' ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Time for First Order *" error={errors.timeForFirstOrder}>
                <div className={`slider-card ${errors.timeForFirstOrder ? 'input-error' : ''}`}>
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-600">Expected first order timeline</span><span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-700">{account.firstOrderMonths || 1} month{Number(account.firstOrderMonths || 1) > 1 ? 's' : ''}</span></div>
                  <input disabled={frozen} type="range" min="1" max="12" value={account.firstOrderMonths || 1} onChange={(e) => { const months = Number(e.target.value); set('firstOrderMonths', months); set('timeForFirstOrder', `Within ${months} month${months > 1 ? 's' : ''}`) }} className="mt-4 w-full" />
                </div>
              </Field>
              <Field label="Expected Qty First Order *" error={errors.expectedQtyFirstOrder}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.expectedQtyFirstOrder ? 'input-error' : ''}`} value={account.expectedQtyFirstOrder ?? ''} onChange={(e) => set('expectedQtyFirstOrder', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 3 Months *" error={errors.expectedQty3Months}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.expectedQty3Months ? 'input-error' : ''}`} value={account.expectedQty3Months ?? ''} onChange={(e) => set('expectedQty3Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 6 Months *" error={errors.expectedQty6Months}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.expectedQty6Months ? 'input-error' : ''}`} value={account.expectedQty6Months ?? ''} onChange={(e) => set('expectedQty6Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 9 Months *" error={errors.expectedQty9Months}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.expectedQty9Months ? 'input-error' : ''}`} value={account.expectedQty9Months ?? ''} onChange={(e) => set('expectedQty9Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 12 Months *" error={errors.expectedQty12Months}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.expectedQty12Months ? 'input-error' : ''}`} value={account.expectedQty12Months ?? ''} onChange={(e) => set('expectedQty12Months', toNumberOrBlank(e.target.value))} /></Field>
            </div>
          ) : null}
          {account.hasPotential === 'FUTURE' ? (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4"><h3 className="font-black">Future potential timeline</h3><span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-700">{account.futurePotentialMonths || 1} month{Number(account.futurePotentialMonths || 1) > 1 ? 's' : ''}</span></div>
              <input disabled={frozen} type="range" min="1" max="12" value={account.futurePotentialMonths || 1} onChange={(e) => set('futurePotentialMonths', Number(e.target.value))} className="mt-5 w-full" />
            </div>
          ) : null}
          {account.hasPotential === 'NO' ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Reason *" error={errors.noPotentialReason}><select disabled={frozen} className={`form-input ${errors.noPotentialReason ? 'input-error' : ''}`} value={account.noPotentialReason || ''} onChange={(e) => set('noPotentialReason', e.target.value)}><option value="">Select</option>{NO_POTENTIAL_REASONS.map((item) => <option key={item} value={item}>{item === 'Company Buy' ? `${account.companyName || 'Company'} Company Buy` : item}</option>)}</select></Field>
              {account.noPotentialReason === 'Company Buy' ? <Field label="Shown Calculator & Presentation of Lease vs Buy? *" error={errors.shownLeaseVsBuyCalculator}><select disabled={frozen} className={`form-input ${errors.shownLeaseVsBuyCalculator ? 'input-error' : ''}`} value={account.shownLeaseVsBuyCalculator || ''} onChange={(e) => set('shownLeaseVsBuyCalculator', e.target.value)}><option value="">Select</option><option>Yes</option><option>No</option></select></Field> : null}
              {account.noPotentialReason === 'C Prompt does not offer the product' ? <Field label="What they want *" error={errors.wantedProduct}><input disabled={frozen} className={`form-input ${errors.wantedProduct ? 'input-error' : ''}`} value={account.wantedProduct || ''} onChange={(e) => set('wantedProduct', e.target.value)} /></Field> : null}
              {account.noPotentialReason === 'Price mismatch' ? <><Field label="Mismatch Price Amount *" error={errors.mismatchPriceAmount}><input disabled={frozen} type="number" min="0" className={`form-input ${errors.mismatchPriceAmount ? 'input-error' : ''}`} value={account.mismatchPriceAmount ?? ''} onChange={(e) => set('mismatchPriceAmount', toNumberOrBlank(e.target.value))} /></Field><Field label="Mismatch Reason *" error={errors.mismatchReason}><textarea disabled={frozen} rows="4" className={`form-input ${errors.mismatchReason ? 'input-error' : ''}`} value={account.mismatchReason || ''} onChange={(e) => set('mismatchReason', e.target.value)} /></Field></> : null}
              {account.noPotentialReason === 'Others' ? <Field label="Other Reason *" error={errors.otherReason}><textarea disabled={frozen} rows="4" className={`form-input ${errors.otherReason ? 'input-error' : ''}`} value={account.otherReason || ''} onChange={(e) => set('otherReason', e.target.value)} /></Field> : null}
            </div>
          ) : null}
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateOpportunityDetails, 'Please fill all mandatory business opportunity details before saving.')} disabled={saving || frozen}>Save Details</button></div>
        </section>
      )}

      {step === 'revenue' && account.saveriskAvailable === 'Yes' && (
        <section className="card">
          <h2 className="section-title">Company Revenue Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Revenue 2 Years Before in Crore *" error={errors['companyDetails.revenueTwoYearsBefore']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.revenueTwoYearsBefore'] ? 'input-error' : ''}`} value={account.companyDetails?.revenueTwoYearsBefore ?? ''} onChange={(e) => setCD('revenueTwoYearsBefore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Previous Year Revenue in Crore *" error={errors['companyDetails.previousYearRevenue']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.previousYearRevenue'] ? 'input-error' : ''}`} value={account.companyDetails?.previousYearRevenue ?? ''} onChange={(e) => setCD('previousYearRevenue', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Latest Revenue in Crore *" error={errors['companyDetails.latestRevenueCrore']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.latestRevenueCrore'] ? 'input-error' : ''}`} value={account.companyDetails?.latestRevenueCrore ?? ''} onChange={(e) => setCD('latestRevenueCrore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Latest Revenue Year *" error={errors['companyDetails.latestRevenueYear']}><input disabled={frozen} list="year-options" inputMode="numeric" className={`form-input ${errors['companyDetails.latestRevenueYear'] ? 'input-error' : ''}`} value={account.companyDetails?.latestRevenueYear ?? ''} onChange={(e) => setCD('latestRevenueYear', e.target.value)} /></Field>
            <Field label="Latest Investment *" error={errors['companyDetails.latestInvestment']}><input disabled={frozen} className={`form-input ${errors['companyDetails.latestInvestment'] ? 'input-error' : ''}`} value={account.companyDetails?.latestInvestment ?? ''} onChange={(e) => setCD('latestInvestment', e.target.value)} /></Field>
            <Field label="Latest Investment Year *" error={errors['companyDetails.latestInvestmentYear']}><input disabled={frozen} list="year-options" inputMode="numeric" className={`form-input ${errors['companyDetails.latestInvestmentYear'] ? 'input-error' : ''}`} value={account.companyDetails?.latestInvestmentYear ?? ''} onChange={(e) => setCD('latestInvestmentYear', e.target.value)} /></Field>
            <Field label="Investment Taken From *" error={errors['companyDetails.investmentTakenFrom']}><input disabled={frozen} className={`form-input ${errors['companyDetails.investmentTakenFrom'] ? 'input-error' : ''}`} value={account.companyDetails?.investmentTakenFrom ?? ''} onChange={(e) => setCD('investmentTakenFrom', e.target.value)} /></Field>
          </div>
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateRevenueDetails, 'Please fill all mandatory revenue details before saving.')} disabled={saving || frozen}>Save Details</button></div>
        </section>
      )}

      {step === 'employees' && account.saveriskAvailable === 'Yes' && (
        <section className="card">
          <h2 className="section-title">Company Employee Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Year of Establishment *" error={errors['companyDetails.yearOfEstablishment']}><input disabled={frozen} list="year-options" inputMode="numeric" className={`form-input ${errors['companyDetails.yearOfEstablishment'] ? 'input-error' : ''}`} value={account.companyDetails?.yearOfEstablishment ?? ''} onChange={(e) => setCD('yearOfEstablishment', e.target.value)} /></Field>
            <Field label="Current Employees *" error={errors['companyDetails.currentEmployees']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.currentEmployees'] ? 'input-error' : ''}`} value={account.companyDetails?.currentEmployees ?? ''} onChange={(e) => setCD('currentEmployees', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Employees 6 Months Before *" error={errors['companyDetails.employeesSixMonthsBefore']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.employeesSixMonthsBefore'] ? 'input-error' : ''}`} value={account.companyDetails?.employeesSixMonthsBefore ?? ''} onChange={(e) => setCD('employeesSixMonthsBefore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="No. of Legal Cases *" error={errors['companyDetails.legalCases']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.legalCases'] ? 'input-error' : ''}`} value={account.companyDetails?.legalCases ?? ''} onChange={(e) => setCD('legalCases', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="No. of High Risk Legal Cases *" error={errors['companyDetails.highRiskLegalCases']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.highRiskLegalCases'] ? 'input-error' : ''}`} value={account.companyDetails?.highRiskLegalCases ?? ''} onChange={(e) => setCD('highRiskLegalCases', toNumberOrBlank(e.target.value))} /></Field>
            {Number(account.companyDetails?.highRiskLegalCases || 0) > 0 ? <Field label="High Risk Cases Responded *" error={errors['companyDetails.highRiskCasesResponded']}><input disabled={frozen} type="number" min="0" className={`form-input ${errors['companyDetails.highRiskCasesResponded'] ? 'input-error' : ''}`} value={account.companyDetails?.highRiskCasesResponded ?? ''} onChange={(e) => setCD('highRiskCasesResponded', toNumberOrBlank(e.target.value))} /></Field> : null}
          </div>
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateEmployeeDetails, 'Please fill all mandatory employee details before saving.')} disabled={saving || frozen}>Save Details</button></div>
        </section>
      )}

      {step === 'devices' && (
        <section className="grid gap-4">
          {!productFormOpen ? (
            <>
              <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="section-title">Products</h2><p className="mt-1 text-sm font-semibold text-slate-500">Add, edit, or remove products. Save returns to the button screen.</p></div>
                {!frozen ? <button type="button" className="btn-secondary" onClick={() => openProductForm(null)}><Plus size={16} /> Add Product</button> : null}
              </div>
              {errors.devices ? <p className="field-error">{errors.devices}</p> : null}
              {(account.devices || []).length > 0 ? <div className="grid gap-3">{(account.devices || []).map((device, index) => <div key={device.deviceId || index} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black text-slate-900">Product {index + 1}: {device.brand} {device.deviceType}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{device.processor} • {device.ram} • {device.storage} • Qty {device.quantity || 0} • ₹{device.pricePerMonth || 0}/month</p></div>{!frozen ? <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" onClick={() => openProductForm(index)}>Edit</button><button type="button" className="btn-danger" onClick={() => setDevices((account.devices || []).filter((_, i) => i !== index))}><Trash2 size={16} /> Remove</button></div> : null}</div>)}</div> : <div className="empty-card"><Laptop className="text-slate-400" /><h3 className="mt-2 text-lg font-black">No product added</h3><p className="mt-1 text-sm font-semibold text-slate-500">You can submit without product details.</p></div>}
              <button type="button" onClick={() => saveSectionAndReturn(validateProducts, 'Please correct product details before saving.')} className="btn-primary w-full" disabled={saving}>Save Products & Back</button>
            </>
          ) : (
            <section className="card">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="section-title">{editingDeviceIndex === null ? 'Add Product Details' : 'Edit Product Details'}</h2><p className="mt-1 text-sm font-semibold text-slate-500">Fill product details and save. You will return to the button screen.</p></div><button type="button" className="btn-secondary" onClick={() => { setProductFormOpen(false); setDraftDevice(null); setEditingDeviceIndex(null); setDeviceError(''); setDeviceErrors({}) }}>Back to Products</button></div>
              {deviceError ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{deviceError}</p> : null}
              <ErrorSummary errors={deviceErrors} title="Product missing / incorrect fields:" />
              <DeviceForm device={draftDevice || createEmptyDevice()} onChange={(next) => { setDraftDevice(next); setDeviceError(''); setDeviceErrors({}) }} onRemove={() => {}} canRemove={false} disabled={frozen} />
              <div className="section-save-row"><button type="button" className="btn-primary" onClick={saveProductDetails} disabled={saving || frozen}>Save Product Details</button></div>
            </section>
          )}
        </section>
      )}
    </main>
  )
}
