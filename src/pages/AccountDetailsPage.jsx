import { useEffect, useMemo, useRef, useState } from 'react'
import React from "react";

import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, ClipboardList, Eye, Plus, Route, Save, Smartphone } from 'lucide-react'
import Badge from '../components/Badge'
import { Field, InfoField } from '../components/Field'
import DeviceForm, { createEmptyDevice, validateDevice } from '../components/DeviceForm'
import {
  APPROVAL_STATUSES,
  BUSINESS_OPPORTUNITIES,
  DELIVERY_STATUSES,
  MAIN_STATUSES,
  ORDER_STATUSES,
  TIME_FOR_FIRST_ORDER,
  TRACKING_STATUSES,
  YEAR_OPTIONS,
} from '../data/constants'

function labelFor(list, code) {
  return list.find((item) => item.code === code)?.label || code
}

function totalQty(account) {
  return (account.devices || []).reduce((sum, device) => sum + Number(device.quantity || 0), 0)
}

function totalValue(account) {
  return (account.devices || []).reduce(
    (sum, device) => sum + Number(device.quantity || 0) * Number(device.pricePerMonth || 0),
    0,
  )
}

const toNumberOrBlank = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  return Number(value)
}

const nonNegativeOrBlank = (value) => {
  return value === '' || value === null || value === undefined || Number(value) >= 0
}

const validYearOrBlank = (value) => {
  if (value === '' || value === null || value === undefined) return true
  return YEAR_OPTIONS.includes(String(value))
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

  useEffect(() => {
    setSourceIndex(0)
    setFailed(false)
  }, [url])

  if (!sources.length || failed) return null

  return (
    <div className="meeting-photo-wrap">
      <div className="meeting-photo-title">Meeting Photograph</div>
      <img
        src={sources[sourceIndex]}
        alt="Meeting"
        className="meeting-photo-img"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (sourceIndex < sources.length - 1) {
            setSourceIndex((current) => current + 1)
          } else {
            setFailed(true)
          }
        }}
      />
    </div>
  )
}

export default function AccountDetailsPage({ accounts, onUpdate }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const existing = accounts.find((item) => item.accountId === id)
  const addDeviceFromCardDone = useRef(false)
  const summarySectionRef = useRef(null)
  const trackingSectionRef = useRef(null)
  const opportunitySectionRef = useRef(null)
  const companySectionRef = useRef(null)
  const devicesSectionRef = useRef(null)

  const [account, setAccount] = useState(existing)
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showEmployeeCalc, setShowEmployeeCalc] = useState(false)
  const [showRevenueCalc, setShowRevenueCalc] = useState(false)

  const frozen = account ? account.isFrozen || ['Won', 'Lost'].includes(account.mainStatus) : false
  const orderSubmitted = account ? account.orderStatus === 'Complete' : false

  const scrollToSection = (ref) => {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
  }

  const scrollToDevicesSection = () => {
    window.setTimeout(() => {
      devicesSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 120)
  }

  useEffect(() => {
    if (addDeviceFromCardDone.current) return
    if (searchParams.get('addDevice') !== '1') return
    if (frozen || orderSubmitted) return

    addDeviceFromCardDone.current = true
    setAccount((prev) => ({
      ...prev,
      devices: [...(prev.devices || []), createEmptyDevice()],
    }))
    scrollToDevicesSection()
  }, [searchParams, frozen, orderSubmitted])

  if (!existing || !account) {
    return (
      <main className="p-6">
        <div className="card">
          Account not found.{' '}
          <Link className="font-bold text-brand-700" to="/accounts">
            Go back
          </Link>
        </div>
      </main>
    )
  }

  const set = (key, value) => {
    setAccount((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const setCD = (key, value) => {
    setAccount((prev) => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [key]: value,
      },
    }))

    setErrors((prev) => ({
      ...prev,
      [`companyDetails.${key}`]: '',
      ...(key === 'legalCases' ? { 'companyDetails.highRiskLegalCases': '' } : {}),
      ...(key === 'highRiskLegalCases' ? { 'companyDetails.legalCases': '' } : {}),
    }))
  }

  const setDevices = (devices) => {
    setAccount((prev) => ({ ...prev, devices }))
  }

  const netEmployees = useMemo(() => {
    const current = account.companyDetails?.currentEmployees ?? ''
    const previous = account.companyDetails?.employeesSixMonthsBefore ?? ''

    if (current === '' && previous === '') return ''
    if (current === '' || previous === '') return ''

    const result = Number(current) - Number(previous)
    return result < 0 ? '' : result
  }, [account.companyDetails])

  const netRevenue = useMemo(() => {
    if (
      (account.companyDetails?.latestRevenueCrore ?? '') === '' &&
      (account.companyDetails?.previousYearRevenue ?? '') === ''
    ) {
      return ''
    }

    return (
      Number(account.companyDetails?.latestRevenueCrore || 0) -
      Number(account.companyDetails?.previousYearRevenue || 0)
    )
  }, [account.companyDetails])

  const validateAccount = () => {
    const nextErrors = {}

    if (!String(account.businessOpportunityWeHave || '').trim()) {
      nextErrors.businessOpportunityWeHave = 'Business Opportunity We Have is required.'
    }

    if (!String(account.referredBy || '').trim()) {
      nextErrors.referredBy = 'Referred By is required.'
    }

    if (account.businessOpportunityWeHave === 'UNKNOWN') {
      if (!String(account.unknownContactName || '').trim()) {
        nextErrors.unknownContactName = 'Name is required.'
      }

      if (!String(account.unknownContactPhone || '').trim()) {
        nextErrors.unknownContactPhone = 'Phone No is required.'
      }
    }

    if (account.hasPotential === 'Yes' && !account.timeForFirstOrder) {
      nextErrors.timeForFirstOrder = 'Time for First Order is required.'
    }

    if (!validYearOrBlank(account.companyDetails?.yearOfEstablishment)) {
      nextErrors['companyDetails.yearOfEstablishment'] = 'Select a year between 1990 and 2026.'
    }

    if (!validYearOrBlank(account.companyDetails?.latestRevenueYear)) {
      nextErrors['companyDetails.latestRevenueYear'] = 'Select a year between 1990 and 2026.'
    }

    if (!validYearOrBlank(account.companyDetails?.latestInvestmentYear)) {
      nextErrors['companyDetails.latestInvestmentYear'] = 'Select a year between 1990 and 2026.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.currentEmployees)) {
      nextErrors['companyDetails.currentEmployees'] = 'Current Employees cannot be negative.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.employeesSixMonthsBefore)) {
      nextErrors['companyDetails.employeesSixMonthsBefore'] =
        'Employees 6 Months Before cannot be negative.'
    }

    if (
      (account.companyDetails?.currentEmployees ?? '') !== '' &&
      (account.companyDetails?.employeesSixMonthsBefore ?? '') !== '' &&
      Number(account.companyDetails?.currentEmployees) <
        Number(account.companyDetails?.employeesSixMonthsBefore)
    ) {
      nextErrors['companyDetails.currentEmployees'] =
        'Current Employees cannot be less than Employees 6 Months Before.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.revenueTwoYearsBefore)) {
      nextErrors['companyDetails.revenueTwoYearsBefore'] =
        'Revenue 2 Years Before cannot be negative.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.previousYearRevenue)) {
      nextErrors['companyDetails.previousYearRevenue'] = 'Previous Year Revenue cannot be negative.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.latestRevenueCrore)) {
      nextErrors['companyDetails.latestRevenueCrore'] = 'Latest Revenue cannot be negative.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.legalCases)) {
      nextErrors['companyDetails.legalCases'] = 'Legal Cases cannot be negative.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.highRiskLegalCases)) {
      nextErrors['companyDetails.highRiskLegalCases'] =
        'High Risk Legal Cases cannot be negative.'
    }

    const legalCases = account.companyDetails?.legalCases ?? ''
    const highRiskLegalCases = account.companyDetails?.highRiskLegalCases ?? ''

    if (highRiskLegalCases !== '' && Number(highRiskLegalCases) > 0 && legalCases === '') {
      nextErrors['companyDetails.legalCases'] =
        'No. of Legal Cases is required when High Risk Legal Cases is entered.'
    }

    if (
      legalCases !== '' &&
      highRiskLegalCases !== '' &&
      Number(highRiskLegalCases) > Number(legalCases)
    ) {
      nextErrors['companyDetails.highRiskLegalCases'] =
        'High Risk Legal Cases cannot be greater than No. of Legal Cases.'
    }

    if (
      Number(account.companyDetails?.highRiskLegalCases || 0) > 0 &&
      account.companyDetails?.highRiskCasesResponded === ''
    ) {
      nextErrors['companyDetails.highRiskCasesResponded'] = 'High Risk Cases Responded is required.'
    }

    if (!nonNegativeOrBlank(account.companyDetails?.highRiskCasesResponded)) {
      nextErrors['companyDetails.highRiskCasesResponded'] =
        'High Risk Cases Responded cannot be negative.'
    }

    const hasInvalidDevice = (account.devices || []).some(
      (device) => Object.keys(validateDevice(device)).length > 0,
    )

    if (hasInvalidDevice) {
      nextErrors.devices = 'Please correct device field errors before saving.'
    }

    return nextErrors
  }

  const submitOrder = () => {
    set('orderStatus', 'Complete')
  }

  const sendApproval = () => {
    const nextErrors = {}

    if (account.trackingStatus !== 'In Progress') {
      nextErrors.trackingStatus = 'Tracking Status must be In Progress before sending for approval.'
    }

    if (account.mainStatus !== 'Negotiation') {
      nextErrors.mainStatus = 'Status must be Negotiation before sending for approval.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }))
      setPageError(
        'Send for Approval allowed only when Tracking Status = In Progress and Status = Negotiation.',
      )
      return
    }

    setPageError('')
    set('approvalStatus', 'Pending Approval')
  }

  const updateMainStatus = (value) => {
    if (value === 'Won' && account.poSent !== 'Yes') {
      setErrors((prev) => ({ ...prev, mainStatus: 'Won is allowed only after PO = Yes.' }))
      setPageError('Won is allowed only after PO = Yes.')
      return
    }

    setPageError('')
    setErrors((prev) => ({ ...prev, mainStatus: '' }))
    setAccount((prev) => ({
      ...prev,
      mainStatus: value,
      isFrozen: ['Won', 'Lost'].includes(value),
      actualClosureDate:
        ['Won', 'Lost'].includes(value) && !prev.actualClosureDate
          ? new Date().toLocaleDateString('en-GB').replace(/\/20/, '/').slice(0, 8)
          : prev.actualClosureDate,
    }))
  }

  const updateQuotation = (value) => {
    if (account.quotationSent === 'Yes' && value === 'No') {
      setErrors((prev) => ({
        ...prev,
        quotationSent: 'Quotation Sent = Yes cannot be changed back to No.',
      }))
      setPageError('Quotation Sent = Yes cannot be changed back to No.')
      return
    }

    if (value === 'Yes' && account.approvalStatus !== 'Approved') {
      setErrors((prev) => ({
        ...prev,
        quotationSent: 'Without approval, quotation cannot be sent.',
      }))
      setPageError('Without approval, quotation cannot be sent.')
      return
    }

    setPageError('')
    setErrors((prev) => ({ ...prev, quotationSent: '' }))
    set('quotationSent', value)
  }

  const updatePO = (value) => {
    if (account.poSent === 'Yes' && value === 'No') {
      setErrors((prev) => ({ ...prev, poSent: 'PO = Yes cannot be changed back to No.' }))
      setPageError('PO = Yes cannot be changed back to No.')
      return
    }

    if (value === 'Yes' && account.quotationSent !== 'Yes') {
      setErrors((prev) => ({
        ...prev,
        poSent: 'PO can become Yes only after quotation is sent.',
      }))
      setPageError('PO can become Yes only after quotation is sent.')
      return
    }

    setPageError('')
    setErrors((prev) => ({ ...prev, poSent: '' }))
    set('poSent', value)
  }

  const changeDevice = (index, nextDevice) => {
    const nextDevices = (account.devices || []).map((device, currentIndex) =>
      currentIndex === index ? nextDevice : device,
    )
    const shouldReapprove = account.approvalStatus === 'Approved'

    setAccount((prev) => ({
      ...prev,
      devices: nextDevices,
      approvalStatus: shouldReapprove ? 'Draft' : prev.approvalStatus,
    }))
  }

  const addDevice = () => {
    setDevices([...(account.devices || []), createEmptyDevice()])
    scrollToDevicesSection()
  }

  const save = async () => {
    const nextErrors = validateAccount()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setPageError('Please correct the highlighted fields.')
      return
    }

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
      nav('/accounts')
    } catch (error) {
      setPageError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-6">
      <datalist id="year-options">
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year} />
        ))}
      </datalist>

      <nav className="section-jump-nav" aria-label="Account section navigation">
        <button type="button" onClick={() => scrollToSection(summarySectionRef)}>
          <Building2 size={15} /> <span>Summary</span>
        </button>
        <button type="button" onClick={() => scrollToSection(trackingSectionRef)}>
          <Route size={15} /> <span>Tracking</span>
        </button>
        <button type="button" onClick={() => scrollToSection(opportunitySectionRef)}>
          <ClipboardList size={15} /> <span>Opportunity</span>
        </button>
        <button type="button" onClick={() => scrollToSection(companySectionRef)}>
          <Building2 size={15} /> <span>Company</span>
        </button>
        <button type="button" onClick={() => scrollToDevicesSection()}>
          <Smartphone size={15} /> <span>Devices</span>
        </button>
      </nav>

      <div className="account-page-title mb-5 mt-4">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-brand-700"
        >
          <ArrowLeft size={16} /> Close / Back
        </button>
        <h1 className="text-3xl font-black">{account.companyName}</h1>
      </div>

      {pageError ? (
        <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {pageError}
        </p>
      ) : null}

      <section ref={summarySectionRef} className="card mb-5 scroll-mt-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Company Card</h2>
            <p className="mt-1 text-sm text-slate-500">
              {account.contactPerson || '-'} • {account.mobile || '-'} • {account.city || '-'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{account.accountType}</Badge>
            <Badge>{labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)}</Badge>
            <Badge>{account.deliveryStatus}</Badge>
            <Badge>{account.orderStatus}</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <InfoField label="Business Opportunity We Have" value={labelFor(BUSINESS_OPPORTUNITIES, account.businessOpportunityWeHave)} />
          <InfoField label="Referred By" value={account.referredBy} />
          <InfoField label="Time for First Order" value={account.timeForFirstOrder} />
          <InfoField label="Total Quantity" value={totalQty(account)} />
          <InfoField label="Monthly Value" value={`₹${totalValue(account).toLocaleString('en-IN')}`} />
          <InfoField label="Quotation Sent" value={account.quotationSent} />
          <InfoField label="PO Sent" value={account.poSent} />
          <InfoField label="Approval Status" value={account.approvalStatus} />
        </div>

        <MeetingPhoto url={account.meetingPhotoUrl} />
      </section>

      <section ref={trackingSectionRef} className="card mb-5 scroll-mt-28">
        <h2 className="section-title">Tracking Flow</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Order Status">
            <select
              disabled={frozen}
              className="form-input"
              value={account.orderStatus || ''}
              onChange={(e) => set('orderStatus', e.target.value)}
            >
              {ORDER_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Tracking Status" error={errors.trackingStatus}>
            <select
              disabled={frozen}
              className={`form-input ${errors.trackingStatus ? 'input-error' : ''}`}
              value={account.trackingStatus || ''}
              onChange={(e) => set('trackingStatus', e.target.value)}
            >
              {TRACKING_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Status" error={errors.mainStatus}>
            <select
              disabled={frozen}
              className={`form-input ${errors.mainStatus ? 'input-error' : ''}`}
              value={account.mainStatus || ''}
              onChange={(e) => updateMainStatus(e.target.value)}
            >
              {MAIN_STATUSES.map((item) => (
                <option key={item} disabled={item === 'Won' && account.poSent !== 'Yes'}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Approval Status">
            <select
              disabled={frozen}
              className="form-input"
              value={account.approvalStatus || ''}
              onChange={(e) => set('approvalStatus', e.target.value)}
            >
              {APPROVAL_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="Quotation Sent" error={errors.quotationSent}>
            <select
              disabled={frozen}
              className={`form-input ${errors.quotationSent ? 'input-error' : ''}`}
              value={account.quotationSent || ''}
              onChange={(e) => updateQuotation(e.target.value)}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>

          <Field label="PO Sent" error={errors.poSent}>
            <select
              disabled={frozen}
              className={`form-input ${errors.poSent ? 'input-error' : ''}`}
              value={account.poSent || ''}
              onChange={(e) => updatePO(e.target.value)}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>

          <Field label="Delivery Status">
            <select
              disabled={frozen || account.mainStatus !== 'Won'}
              className="form-input"
              value={account.deliveryStatus || ''}
              onChange={(e) => set('deliveryStatus', e.target.value)}
            >
              {DELIVERY_STATUSES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Actual Closure Date">
            <input disabled className="form-input" value={account.actualClosureDate || ''} />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={frozen || orderSubmitted}
            onClick={submitOrder}
            className="btn-secondary"
          >
            Submit Order
          </button>
          <button type="button" disabled={frozen} onClick={sendApproval} className="btn-secondary">
            Send for Approval
          </button>
          <button
            type="button"
            disabled={frozen}
            onClick={() => set('approvalStatus', 'Approved')}
            className="btn-secondary"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={frozen}
            onClick={() => set('approvalStatus', 'Rejected')}
            className="btn-secondary"
          >
            Reject
          </button>
        </div>

        <div className="section-save-row">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Tracking & Close'}
          </button>
        </div>
      </section>

      <section ref={opportunitySectionRef} className="card mb-5 scroll-mt-28">
        <h2 className="section-title">Opportunity Form</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Referred By *" error={errors.referredBy}>
            <input
              disabled={frozen}
              className={`form-input ${errors.referredBy ? 'input-error' : ''}`}
              value={account.referredBy || ''}
              onChange={(e) => set('referredBy', e.target.value)}
            />
          </Field>

          <Field label="Business Opportunity We Have *" error={errors.businessOpportunityWeHave}>
            <select
              disabled={frozen}
              className={`form-input ${errors.businessOpportunityWeHave ? 'input-error' : ''}`}
              value={account.businessOpportunityWeHave || ''}
              onChange={(e) => set('businessOpportunityWeHave', e.target.value)}
            >
              <option value="">Select opportunity</option>
              {BUSINESS_OPPORTUNITIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Time for First Order" error={errors.timeForFirstOrder}>
            <select
              disabled={frozen || account.hasPotential === 'No'}
              className={`form-input ${errors.timeForFirstOrder ? 'input-error' : ''}`}
              value={account.timeForFirstOrder || ''}
              onChange={(e) => set('timeForFirstOrder', e.target.value)}
            >
              <option value="">Select time</option>
              {TIME_FOR_FIRST_ORDER.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>

        {account.businessOpportunityWeHave === 'UNKNOWN' ? (
          <div className="mt-4 grid gap-4 rounded-3xl bg-slate-50 p-4 md:grid-cols-4">
            <Field label="Name *" error={errors.unknownContactName}>
              <input
                disabled={frozen}
                className={`form-input ${errors.unknownContactName ? 'input-error' : ''}`}
                value={account.unknownContactName || ''}
                onChange={(e) => set('unknownContactName', e.target.value)}
              />
            </Field>

            <Field label="Designation">
              <input
                disabled={frozen}
                className="form-input"
                value={account.unknownContactDesignation || ''}
                onChange={(e) => set('unknownContactDesignation', e.target.value)}
              />
            </Field>

            <Field label="Phone No *" error={errors.unknownContactPhone}>
              <input
                disabled={frozen}
                className={`form-input ${errors.unknownContactPhone ? 'input-error' : ''}`}
                value={account.unknownContactPhone || ''}
                onChange={(e) => set('unknownContactPhone', e.target.value)}
              />
            </Field>

            <Field label="Email">
              <input
                disabled={frozen}
                className="form-input"
                value={account.unknownContactEmail || ''}
                onChange={(e) => set('unknownContactEmail', e.target.value)}
              />
            </Field>
          </div>
        ) : null}
        <div className="section-save-row">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Opportunity & Close'}
          </button>
        </div>
      </section>

      <section ref={companySectionRef} className="card mb-5 scroll-mt-28">
        <div className="company-header">
          <h2 className="section-title">Company Details</h2>
          <div className="company-eye-actions">
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowEmployeeCalc(!showEmployeeCalc)}
            >
              <Eye size={16} /> Employees
            </button>
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowRevenueCalc(!showRevenueCalc)}
            >
              <Eye size={16} /> Revenue
            </button>
          </div>
        </div>

        {showEmployeeCalc ? (
          <div className="info-box">
            <p>
              <b>Total Employees:</b> {account.companyDetails?.currentEmployees || '-'}
            </p>
            <p>
              <b>Employees 6 Months Before:</b>{' '}
              {account.companyDetails?.employeesSixMonthsBefore || '-'}
            </p>
            <p>
              <b>Net Employees Last 6 Months:</b> {netEmployees === '' ? '-' : netEmployees}
            </p>
          </div>
        ) : null}

        {showRevenueCalc ? (
          <div className="info-box">
            <p>
              <b>Revenue 2 Years Before:</b> {account.companyDetails?.revenueTwoYearsBefore || '-'} Cr
            </p>
            <p>
              <b>Previous Year Revenue:</b> {account.companyDetails?.previousYearRevenue || '-'} Cr
            </p>
            <p>
              <b>Latest Revenue:</b> {account.companyDetails?.latestRevenueCrore || '-'} Cr
            </p>
            <p>
              <b>Net Revenue Increase From Last Year:</b> {netRevenue === '' ? '-' : netRevenue} Cr
            </p>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Year Of Establishment" error={errors['companyDetails.yearOfEstablishment']}>
            <input
              disabled={frozen}
              list="year-options"
              inputMode="numeric"
              className={`form-input ${
                errors['companyDetails.yearOfEstablishment'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.yearOfEstablishment ?? ''}
              onChange={(e) => setCD('yearOfEstablishment', e.target.value)}
              placeholder="Search/select year"
            />
          </Field>

          <Field label="Headquarter Location">
            <input
              disabled={frozen}
              className="form-input"
              value={account.companyDetails?.headquarterLocation ?? ''}
              onChange={(e) => setCD('headquarterLocation', e.target.value)}
            />
          </Field>

          <Field label="Current Employees" error={errors['companyDetails.currentEmployees']}>
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${errors['companyDetails.currentEmployees'] ? 'input-error' : ''}`}
              value={account.companyDetails?.currentEmployees ?? ''}
              onChange={(e) => setCD('currentEmployees', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field
            label="Employees 6 Months Before"
            error={errors['companyDetails.employeesSixMonthsBefore']}
          >
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${
                errors['companyDetails.employeesSixMonthsBefore'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.employeesSixMonthsBefore ?? ''}
              onChange={(e) => setCD('employeesSixMonthsBefore', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field label="Net Employees Last 6 Months">
            <input
              disabled
              className="form-input"
              value={netEmployees}
              placeholder="Auto calculated, cannot be negative"
            />
          </Field>

          <Field
            label="Revenue 2 Years Before in Crore"
            error={errors['companyDetails.revenueTwoYearsBefore']}
          >
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${
                errors['companyDetails.revenueTwoYearsBefore'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.revenueTwoYearsBefore ?? ''}
              onChange={(e) => setCD('revenueTwoYearsBefore', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field
            label="Previous Year Revenue in Crore"
            error={errors['companyDetails.previousYearRevenue']}
          >
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${
                errors['companyDetails.previousYearRevenue'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.previousYearRevenue ?? ''}
              onChange={(e) => setCD('previousYearRevenue', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field
            label="Latest Revenue in Crore"
            error={errors['companyDetails.latestRevenueCrore']}
          >
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${
                errors['companyDetails.latestRevenueCrore'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.latestRevenueCrore ?? ''}
              onChange={(e) => setCD('latestRevenueCrore', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field label="Latest Revenue Year" error={errors['companyDetails.latestRevenueYear']}>
            <input
              disabled={frozen}
              list="year-options"
              inputMode="numeric"
              className={`form-input ${errors['companyDetails.latestRevenueYear'] ? 'input-error' : ''}`}
              value={account.companyDetails?.latestRevenueYear ?? ''}
              onChange={(e) => setCD('latestRevenueYear', e.target.value)}
              placeholder="Search/select year"
            />
          </Field>

          <Field label="Net Revenue Increase From Last Year in Crore">
            <input
              disabled
              className="form-input"
              value={netRevenue}
              placeholder="Auto calculated, can be negative"
            />
          </Field>

          <Field label="Latest Investment">
            <input
              disabled={frozen}
              className="form-input"
              value={account.companyDetails?.latestInvestment ?? ''}
              onChange={(e) => setCD('latestInvestment', e.target.value)}
            />
          </Field>

          <Field label="Latest Investment Year" error={errors['companyDetails.latestInvestmentYear']}>
            <input
              disabled={frozen}
              list="year-options"
              inputMode="numeric"
              className={`form-input ${
                errors['companyDetails.latestInvestmentYear'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.latestInvestmentYear ?? ''}
              onChange={(e) => setCD('latestInvestmentYear', e.target.value)}
              placeholder="Search/select year"
            />
          </Field>

          <Field label="Investment Taken From">
            <input
              disabled={frozen}
              className="form-input"
              value={account.companyDetails?.investmentTakenFrom ?? ''}
              onChange={(e) => setCD('investmentTakenFrom', e.target.value)}
            />
          </Field>

          <Field label="No. of Legal Cases" error={errors['companyDetails.legalCases']}>
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${errors['companyDetails.legalCases'] ? 'input-error' : ''}`}
              value={account.companyDetails?.legalCases ?? ''}
              onChange={(e) => setCD('legalCases', toNumberOrBlank(e.target.value))}
            />
          </Field>

          <Field
            label="No. of High Risk Legal Cases"
            error={errors['companyDetails.highRiskLegalCases']}
          >
            <input
              disabled={frozen}
              type="number"
              min="0"
              className={`form-input ${
                errors['companyDetails.highRiskLegalCases'] ? 'input-error' : ''
              }`}
              value={account.companyDetails?.highRiskLegalCases ?? ''}
              onChange={(e) => setCD('highRiskLegalCases', toNumberOrBlank(e.target.value))}
            />
          </Field>

          {Number(account.companyDetails?.highRiskLegalCases || 0) > 0 ? (
            <Field
              label="High Risk Cases Responded *"
              error={errors['companyDetails.highRiskCasesResponded']}
            >
              <input
                disabled={frozen}
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.highRiskCasesResponded'] ? 'input-error' : ''
                }`}
                value={account.companyDetails?.highRiskCasesResponded ?? ''}
                onChange={(e) => setCD('highRiskCasesResponded', toNumberOrBlank(e.target.value))}
              />
            </Field>
          ) : null}
        </div>

        <div className="section-save-row">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Company Details & Close'}
          </button>
        </div>
      </section>

      <section ref={devicesSectionRef} className="scroll-mt-28 grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title">Devices</h2>
          {!orderSubmitted && !frozen ? (
            <button type="button" className="btn-secondary" onClick={addDevice}>
              <Plus size={16} /> Add Device
            </button>
          ) : null}
        </div>

        {errors.devices ? <p className="field-error">{errors.devices}</p> : null}

        {(account.devices || []).length > 0 ? (
          (account.devices || []).map((device, index) => (
            <DeviceForm
              key={device.deviceId}
              device={device}
              disabled={frozen}
              onChange={(nextDevice) => changeDevice(index, nextDevice)}
              onRemove={() =>
                setDevices((account.devices || []).filter((_, currentIndex) => currentIndex !== index))
              }
              canRemove={!orderSubmitted && !frozen}
            />
          ))
        ) : (
          <div className="empty-card">
            <h3 className="text-lg font-black">No devices added yet</h3>
            {!orderSubmitted && !frozen ? (
              <button type="button" className="btn-primary mt-4" onClick={addDevice}>
                <Plus size={16} /> Add Device
              </button>
            ) : null}
          </div>
        )}

        <div className="section-save-row">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Devices & Close'}
          </button>
        </div>
      </section>
    </main>
  )
}
