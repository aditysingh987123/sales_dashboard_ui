import { useMemo, useState } from 'react'
import React from "react";

import { useNavigate } from 'react-router-dom'
import { Camera, Save } from 'lucide-react'
import { Field } from '../components/Field'
import {
  ACCOUNT_TYPES,
  BUSINESS_OPPORTUNITIES,
  NO_POTENTIAL_REASONS,
  TIME_FOR_FIRST_ORDER,
  YEAR_OPTIONS,
} from '../data/constants'
import { todayDDMMYY, uid } from '../utils/dateUtils'

const base = {
  existingAccountId: '',
  companyName: '',
  contactPerson: '',
  mobile: '',
  email: '',
  city: '',
  accountType: '',
  businessOpportunityWeHave: '',
  referredBy: '',
  hasPotential: '',
  timeForFirstOrder: '',
  expectedQtyFirstOrder: '',
  expectedQty3Months: '',
  expectedQty6Months: '',
  expectedQty9Months: '',
  expectedQty12Months: '',
  noPotentialReason: '',
  shownLeaseVsBuyCalculator: '',
  wantedProduct: '',
  mismatchPriceAmount: '',
  mismatchReason: '',
  otherReason: '',
  unknownContactName: '',
  unknownContactDesignation: '',
  unknownContactPhone: '',
  unknownContactEmail: '',
  orderStatus: 'Pending',
  trackingStatus: 'Not Started',
  mainStatus: 'Prospecting',
  quotationSent: 'No',
  poSent: 'No',
  deliveryStatus: 'ND',
  approvalStatus: 'Draft',
  remarks: '',
  isFrozen: false,
  companyDetails: {
    yearOfEstablishment: '',
    headquarterLocation: '',
    currentEmployees: '',
    employeesSixMonthsBefore: '',
    netEmployeesLastSixMonths: '',
    revenueTwoYearsBefore: '',
    latestRevenueCrore: '',
    latestRevenueYear: '',
    previousYearRevenue: '',
    netRevenueIncreaseFromLastYear: '',
    latestInvestment: '',
    latestInvestmentYear: '',
    investmentTakenFrom: '',
    legalCases: '',
    highRiskLegalCases: '',
    highRiskCasesResponded: '',
  },
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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

function uniqueCompanies(accounts = []) {
  const map = new Map()

  accounts.forEach((account) => {
    const companyName = String(account.companyName || '').trim()
    if (!companyName) return

    const key = companyName.toLowerCase()
    if (!map.has(key)) map.set(key, account)
  })

  return Array.from(map.values()).sort((a, b) =>
    String(a.companyName || '').localeCompare(String(b.companyName || '')),
  )
}

export default function AddAccountPage({ accounts = [], onSave }) {
  const nav = useNavigate()

  const [form, setForm] = useState(base)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false)
  const [showRevenueInfo, setShowRevenueInfo] = useState(false)

  const existingCompanies = useMemo(() => uniqueCompanies(accounts), [accounts])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const setCD = (key, value) => {
    setForm((prev) => ({
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

  const netEmployees = useMemo(() => {
    const current = form.companyDetails.currentEmployees
    const previous = form.companyDetails.employeesSixMonthsBefore

    if (current === '' && previous === '') return ''
    if (current === '' || previous === '') return ''

    const result = Number(current) - Number(previous)
    return result < 0 ? '' : result
  }, [form.companyDetails.currentEmployees, form.companyDetails.employeesSixMonthsBefore])

  const netRevenue = useMemo(() => {
    if (
      form.companyDetails.latestRevenueCrore === '' &&
      form.companyDetails.previousYearRevenue === ''
    ) {
      return ''
    }

    return (
      Number(form.companyDetails.latestRevenueCrore || 0) -
      Number(form.companyDetails.previousYearRevenue || 0)
    )
  }, [form.companyDetails.latestRevenueCrore, form.companyDetails.previousYearRevenue])

  const choosePhoto = async (e) => {
    const selectedPhoto = e.target.files?.[0]
    if (!selectedPhoto) return

    setPhoto(selectedPhoto)
    setPhotoPreview(await fileToBase64(selectedPhoto))
    setErrors((prev) => ({ ...prev, meetingPhoto: '' }))
  }

  const onAccountTypeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      accountType: value,
      existingAccountId: value === 'E' ? prev.existingAccountId : '',
    }))

    setErrors((prev) => ({
      ...prev,
      accountType: '',
      existingAccountId: '',
    }))
  }

  const selectExistingCompany = (accountId) => {
    const selected = existingCompanies.find((account) => account.accountId === accountId)

    if (!selected) {
      setForm((prev) => ({ ...prev, existingAccountId: accountId }))
      return
    }

    setForm((prev) => ({
      ...prev,
      existingAccountId: selected.accountId,
      companyName: selected.companyName || '',
      contactPerson: selected.contactPerson || '',
      mobile: selected.mobile || '',
      email: selected.email || '',
      city: selected.city || '',
      businessOpportunityWeHave:
        selected.businessOpportunityWeHave || prev.businessOpportunityWeHave,
      unknownContactName: selected.unknownContactName || '',
      unknownContactDesignation: selected.unknownContactDesignation || '',
      unknownContactPhone: selected.unknownContactPhone || '',
      unknownContactEmail: selected.unknownContactEmail || '',
      companyDetails: {
        ...prev.companyDetails,
        ...(selected.companyDetails || {}),
      },
    }))

    setErrors((prev) => ({
      ...prev,
      existingAccountId: '',
      companyName: '',
      contactPerson: '',
      mobile: '',
      businessOpportunityWeHave: '',
      unknownContactName: '',
      unknownContactPhone: '',
    }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.accountType) nextErrors.accountType = 'Account Type is required.'

    if (form.accountType === 'E' && !form.existingAccountId) {
      nextErrors.existingAccountId = 'Select existing company.'
    }

    if (!String(form.companyName || '').trim()) nextErrors.companyName = 'Company Name is required.'
    if (!String(form.contactPerson || '').trim()) nextErrors.contactPerson = 'Contact Person is required.'
    if (!String(form.mobile || '').trim()) nextErrors.mobile = 'Mobile is required.'
    if (!String(form.referredBy || '').trim()) nextErrors.referredBy = 'Referred By is required.'

    if (!form.businessOpportunityWeHave) {
      nextErrors.businessOpportunityWeHave = 'Business Opportunity We Have is required.'
    }

    if (!photoPreview) nextErrors.meetingPhoto = 'Meeting photograph is mandatory.'
    if (!form.hasPotential) nextErrors.hasPotential = 'Select whether we have potentials.'

    const quantityFields = [
      'expectedQtyFirstOrder',
      'expectedQty3Months',
      'expectedQty6Months',
      'expectedQty9Months',
      'expectedQty12Months',
    ]

    quantityFields.forEach((key) => {
      if (!nonNegativeOrBlank(form[key])) nextErrors[key] = 'Value cannot be negative.'
    })

    if (form.hasPotential === 'Yes' && !form.timeForFirstOrder) {
      nextErrors.timeForFirstOrder = 'Time for First Order is required.'
    }

    if (form.hasPotential === 'No') {
      if (!form.noPotentialReason) nextErrors.noPotentialReason = 'Reason is required.'

      if (form.noPotentialReason === 'They buy' && !form.shownLeaseVsBuyCalculator) {
        nextErrors.shownLeaseVsBuyCalculator = 'Select Yes or No.'
      }

      if (
        form.noPotentialReason === "We don't offer the product" &&
        !String(form.wantedProduct || '').trim()
      ) {
        nextErrors.wantedProduct = 'Enter what they want.'
      }

      if (form.noPotentialReason === 'Price mismatch') {
        if (form.mismatchPriceAmount === '') {
          nextErrors.mismatchPriceAmount = 'Mismatch price amount is required.'
        } else if (!nonNegativeOrBlank(form.mismatchPriceAmount)) {
          nextErrors.mismatchPriceAmount = 'Amount cannot be negative.'
        }

        if (String(form.mismatchReason || '').trim().length < 25) {
          nextErrors.mismatchReason = 'Mismatch reason must be minimum 25 characters.'
        }
      }

      if (form.noPotentialReason === 'Others' && !String(form.otherReason || '').trim()) {
        nextErrors.otherReason = 'Other reason is required.'
      }
    }

    if (form.businessOpportunityWeHave === 'UNKNOWN') {
      if (!String(form.unknownContactName || '').trim()) {
        nextErrors.unknownContactName = 'Name is required.'
      }

      if (!String(form.unknownContactPhone || '').trim()) {
        nextErrors.unknownContactPhone = 'Phone No is required.'
      }
    }

    if (!validYearOrBlank(form.companyDetails.yearOfEstablishment)) {
      nextErrors['companyDetails.yearOfEstablishment'] = 'Select a year between 1990 and 2026.'
    }

    if (!validYearOrBlank(form.companyDetails.latestRevenueYear)) {
      nextErrors['companyDetails.latestRevenueYear'] = 'Select a year between 1990 and 2026.'
    }

    if (!validYearOrBlank(form.companyDetails.latestInvestmentYear)) {
      nextErrors['companyDetails.latestInvestmentYear'] = 'Select a year between 1990 and 2026.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.currentEmployees)) {
      nextErrors['companyDetails.currentEmployees'] = 'Current Employees cannot be negative.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.employeesSixMonthsBefore)) {
      nextErrors['companyDetails.employeesSixMonthsBefore'] =
        'Employees 6 Months Before cannot be negative.'
    }

    if (
      form.companyDetails.currentEmployees !== '' &&
      form.companyDetails.employeesSixMonthsBefore !== '' &&
      Number(form.companyDetails.currentEmployees) <
        Number(form.companyDetails.employeesSixMonthsBefore)
    ) {
      nextErrors['companyDetails.currentEmployees'] =
        'Current Employees cannot be less than Employees 6 Months Before.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.revenueTwoYearsBefore)) {
      nextErrors['companyDetails.revenueTwoYearsBefore'] =
        'Revenue 2 Years Before cannot be negative.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.previousYearRevenue)) {
      nextErrors['companyDetails.previousYearRevenue'] = 'Previous Year Revenue cannot be negative.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.latestRevenueCrore)) {
      nextErrors['companyDetails.latestRevenueCrore'] = 'Latest Revenue cannot be negative.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.legalCases)) {
      nextErrors['companyDetails.legalCases'] = 'Legal Cases cannot be negative.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.highRiskLegalCases)) {
      nextErrors['companyDetails.highRiskLegalCases'] = 'High Risk Legal Cases cannot be negative.'
    }

    const legalCases = form.companyDetails.legalCases
    const highRiskLegalCases = form.companyDetails.highRiskLegalCases

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
      Number(form.companyDetails.highRiskLegalCases || 0) > 0 &&
      form.companyDetails.highRiskCasesResponded === ''
    ) {
      nextErrors['companyDetails.highRiskCasesResponded'] =
        'High Risk Cases Responded is required.'
    }

    if (!nonNegativeOrBlank(form.companyDetails.highRiskCasesResponded)) {
      nextErrors['companyDetails.highRiskCasesResponded'] =
        'High Risk Cases Responded cannot be negative.'
    }

    return nextErrors
  }

  const submit = async (e) => {
    e.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setPageError('Please correct the highlighted fields.')
      return
    }

    setPageError('')
    setSaving(true)

    try {
      const account = {
        ...form,
        accountId: uid('ACC'),
        createdDate: todayDDMMYY(),
        meetingPhotoBase64: photoPreview,
        meetingPhotoName: photo?.name || 'meeting-photo.jpg',
        meetingPhotoUrl: photoPreview,
        companyDetails: {
          ...form.companyDetails,
          netEmployeesLastSixMonths: netEmployees,
          netRevenueIncreaseFromLastYear: netRevenue,
        },
        devices: [],
      }

      delete account.existingAccountId

      await onSave(account)
      nav('/accounts')
    } catch (err) {
      setPageError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Add Account</h1>
        <p className="text-slate-500">
          Fill account details and upload one mandatory meeting photograph. Devices can be
          added later from the company card.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-5" noValidate>
        <datalist id="year-options">
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year} />
          ))}
        </datalist>

        <section className="card">
          <h2 className="section-title">Basic Details</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Account Type *" error={errors.accountType}>
              <select
                className={`form-input ${errors.accountType ? 'input-error' : ''}`}
                value={form.accountType}
                onChange={(e) => onAccountTypeChange(e.target.value)}
              >
                <option value="">Select account type</option>
                {ACCOUNT_TYPES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            {form.accountType === 'E' && (
              <Field label="Existing Company *" error={errors.existingAccountId}>
                <select
                  className={`form-input ${errors.existingAccountId ? 'input-error' : ''}`}
                  value={form.existingAccountId}
                  onChange={(e) => selectExistingCompany(e.target.value)}
                >
                  <option value="">Select existing company</option>
                  {existingCompanies.map((account) => (
                    <option key={account.accountId} value={account.accountId}>
                      {account.companyName}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Company Name *" error={errors.companyName}>
              <input
                className={`form-input ${errors.companyName ? 'input-error' : ''}`}
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </Field>

            <Field label="Contact Person *" error={errors.contactPerson}>
              <input
                className={`form-input ${errors.contactPerson ? 'input-error' : ''}`}
                value={form.contactPerson}
                onChange={(e) => set('contactPerson', e.target.value)}
              />
            </Field>

            <Field label="Mobile *" error={errors.mobile}>
              <input
                className={`form-input ${errors.mobile ? 'input-error' : ''}`}
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
              />
            </Field>

            <Field label="Email">
              <input
                className="form-input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>

            <Field label="City">
              <input
                className="form-input"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </Field>

            <Field label="Referred By *" error={errors.referredBy}>
              <input
                className={`form-input ${errors.referredBy ? 'input-error' : ''}`}
                value={form.referredBy}
                onChange={(e) => set('referredBy', e.target.value)}
                placeholder="Enter referred by"
              />
            </Field>

            <Field
              label="Business Opportunity We Have *"
              error={errors.businessOpportunityWeHave}
            >
              <select
                className={`form-input ${
                  errors.businessOpportunityWeHave ? 'input-error' : ''
                }`}
                value={form.businessOpportunityWeHave}
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
          </div>

          {form.businessOpportunityWeHave === 'UNKNOWN' && (
            <div className="mt-4 grid gap-4 rounded-3xl bg-slate-50 p-4 md:grid-cols-4">
              <Field label="Name *" error={errors.unknownContactName}>
                <input
                  className={`form-input ${errors.unknownContactName ? 'input-error' : ''}`}
                  value={form.unknownContactName}
                  onChange={(e) => set('unknownContactName', e.target.value)}
                />
              </Field>

              <Field label="Designation">
                <input
                  className="form-input"
                  value={form.unknownContactDesignation}
                  onChange={(e) => set('unknownContactDesignation', e.target.value)}
                />
              </Field>

              <Field label="Phone No *" error={errors.unknownContactPhone}>
                <input
                  className={`form-input ${errors.unknownContactPhone ? 'input-error' : ''}`}
                  value={form.unknownContactPhone}
                  onChange={(e) => set('unknownContactPhone', e.target.value)}
                />
              </Field>

              <Field label="Email">
                <input
                  className="form-input"
                  value={form.unknownContactEmail}
                  onChange={(e) => set('unknownContactEmail', e.target.value)}
                />
              </Field>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Meeting Photograph</h2>
          <p className="text-sm text-slate-500">One photograph is mandatory.</p>

          {errors.meetingPhoto ? (
            <p className="field-error mt-4">{errors.meetingPhoto}</p>
          ) : null}

          <label
            className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-slate-50 p-6 text-center ${
              errors.meetingPhoto ? 'border-red-300' : 'border-slate-200'
            }`}
          >
            <Camera className="mb-2 text-brand-700" />
            <span className="font-black">Upload Meeting Photograph *</span>
            <input type="file" accept="image/*" className="hidden" onChange={choosePhoto} />
          </label>

          {photoPreview ? (
            <img
              src={photoPreview}
              className="mt-4 h-52 w-full rounded-3xl object-cover"
              alt="Meeting preview"
            />
          ) : null}
        </section>

        <section className="card">
          <h2 className="section-title">Potential</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Do we have potentials? *" error={errors.hasPotential}>
              <select
                className={`form-input ${errors.hasPotential ? 'input-error' : ''}`}
                value={form.hasPotential}
                onChange={(e) => set('hasPotential', e.target.value)}
              >
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </Field>

            {form.hasPotential === 'Yes' && (
              <>
                <Field label="Time for First Order *" error={errors.timeForFirstOrder}>
                  <select
                    className={`form-input ${errors.timeForFirstOrder ? 'input-error' : ''}`}
                    value={form.timeForFirstOrder}
                    onChange={(e) => set('timeForFirstOrder', e.target.value)}
                  >
                    <option value="">Select time</option>
                    {TIME_FOR_FIRST_ORDER.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                {[
                  ['expectedQtyFirstOrder', 'Expected Qty First Order'],
                  ['expectedQty3Months', 'Expected Qty 3 Months'],
                  ['expectedQty6Months', 'Expected Qty 6 Months'],
                  ['expectedQty9Months', 'Expected Qty 9 Months'],
                  ['expectedQty12Months', 'Expected Qty 12 Months'],
                ].map(([key, label]) => (
                  <Field key={key} label={label} error={errors[key]}>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${errors[key] ? 'input-error' : ''}`}
                      value={form[key]}
                      onChange={(e) => set(key, toNumberOrBlank(e.target.value))}
                      placeholder="0 allowed"
                    />
                  </Field>
                ))}
              </>
            )}
          </div>

          {form.hasPotential === 'No' && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Reason *" error={errors.noPotentialReason}>
                <select
                  className={`form-input ${errors.noPotentialReason ? 'input-error' : ''}`}
                  value={form.noPotentialReason}
                  onChange={(e) => set('noPotentialReason', e.target.value)}
                >
                  <option value="">Select</option>
                  {NO_POTENTIAL_REASONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              {form.noPotentialReason === 'They buy' && (
                <Field
                  label="Shown Calculator & Presentation of Lease vs Buy? *"
                  error={errors.shownLeaseVsBuyCalculator}
                >
                  <select
                    className={`form-input ${
                      errors.shownLeaseVsBuyCalculator ? 'input-error' : ''
                    }`}
                    value={form.shownLeaseVsBuyCalculator}
                    onChange={(e) => set('shownLeaseVsBuyCalculator', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
              )}

              {form.noPotentialReason === "We don't offer the product" && (
                <Field label="What they want *" error={errors.wantedProduct}>
                  <input
                    className={`form-input ${errors.wantedProduct ? 'input-error' : ''}`}
                    value={form.wantedProduct}
                    onChange={(e) => set('wantedProduct', e.target.value)}
                  />
                </Field>
              )}

              {form.noPotentialReason === 'Price mismatch' && (
                <>
                  <Field label="Mismatch Price Amount *" error={errors.mismatchPriceAmount}>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${
                        errors.mismatchPriceAmount ? 'input-error' : ''
                      }`}
                      value={form.mismatchPriceAmount}
                      onChange={(e) => set('mismatchPriceAmount', toNumberOrBlank(e.target.value))}
                    />
                  </Field>

                  <Field label="Mismatch Reason *" error={errors.mismatchReason}>
                    <textarea
                      className={`form-input ${errors.mismatchReason ? 'input-error' : ''}`}
                      value={form.mismatchReason}
                      onChange={(e) => set('mismatchReason', e.target.value)}
                      placeholder="Minimum 25 characters"
                    />
                  </Field>
                </>
              )}

              {form.noPotentialReason === 'Others' && (
                <Field label="Other Reason *" error={errors.otherReason}>
                  <textarea
                    className={`form-input ${errors.otherReason ? 'input-error' : ''}`}
                    value={form.otherReason}
                    onChange={(e) => set('otherReason', e.target.value)}
                  />
                </Field>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <div className="company-header">
            <h2 className="section-title">Company Details</h2>

            <div className="company-eye-actions">
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowEmployeeInfo(!showEmployeeInfo)}
              >
                👁 Employees
              </button>

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowRevenueInfo(!showRevenueInfo)}
              >
                👁 Revenue
              </button>
            </div>
          </div>

          {showEmployeeInfo && (
            <div className="info-box">
              <p>
                <b>Total Employees:</b> {form.companyDetails.currentEmployees || '-'}
              </p>
              <p>
                <b>Employees 6 Months Before:</b>{' '}
                {form.companyDetails.employeesSixMonthsBefore || '-'}
              </p>
              <p>
                <b>Net Employees Last 6 Months:</b> {netEmployees === '' ? '-' : netEmployees}
              </p>
            </div>
          )}

          {showRevenueInfo && (
            <div className="info-box">
              <p>
                <b>Revenue 2 Years Before:</b>{' '}
                {form.companyDetails.revenueTwoYearsBefore || '-'} Cr
              </p>
              <p>
                <b>Previous Year Revenue:</b>{' '}
                {form.companyDetails.previousYearRevenue || '-'} Cr
              </p>
              <p>
                <b>Latest Revenue:</b> {form.companyDetails.latestRevenueCrore || '-'} Cr
              </p>
              <p>
                <b>Net Revenue Increase From Last Year:</b>{' '}
                {netRevenue === '' ? '-' : netRevenue} Cr
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field
              label="Year of Establishment"
              error={errors['companyDetails.yearOfEstablishment']}
            >
              <input
                list="year-options"
                inputMode="numeric"
                className={`form-input ${
                  errors['companyDetails.yearOfEstablishment'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.yearOfEstablishment}
                onChange={(e) => setCD('yearOfEstablishment', e.target.value)}
                placeholder="Search/select year"
              />
            </Field>

            <Field label="Headquarter Location">
              <input
                className="form-input"
                value={form.companyDetails.headquarterLocation}
                onChange={(e) => setCD('headquarterLocation', e.target.value)}
              />
            </Field>

            <Field label="Current Employees" error={errors['companyDetails.currentEmployees']}>
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.currentEmployees'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.currentEmployees}
                onChange={(e) => setCD('currentEmployees', toNumberOrBlank(e.target.value))}
              />
            </Field>

            <Field
              label="Employees 6 Months Before"
              error={errors['companyDetails.employeesSixMonthsBefore']}
            >
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.employeesSixMonthsBefore'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.employeesSixMonthsBefore}
                onChange={(e) =>
                  setCD('employeesSixMonthsBefore', toNumberOrBlank(e.target.value))
                }
              />
            </Field>

            <Field label="Net Employees Last 6 Months">
              <input
                className="form-input"
                readOnly
                value={netEmployees}
                placeholder="Auto calculated, cannot be negative"
              />
            </Field>

            <Field
              label="Revenue 2 Years Before in Crore"
              error={errors['companyDetails.revenueTwoYearsBefore']}
            >
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.revenueTwoYearsBefore'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.revenueTwoYearsBefore}
                onChange={(e) => setCD('revenueTwoYearsBefore', toNumberOrBlank(e.target.value))}
              />
            </Field>

            <Field
              label="Previous Year Revenue in Crore"
              error={errors['companyDetails.previousYearRevenue']}
            >
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.previousYearRevenue'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.previousYearRevenue}
                onChange={(e) => setCD('previousYearRevenue', toNumberOrBlank(e.target.value))}
              />
            </Field>

            <Field
              label="Latest Revenue in Crore"
              error={errors['companyDetails.latestRevenueCrore']}
            >
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.latestRevenueCrore'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.latestRevenueCrore}
                onChange={(e) => setCD('latestRevenueCrore', toNumberOrBlank(e.target.value))}
              />
            </Field>

            <Field label="Latest Revenue Year" error={errors['companyDetails.latestRevenueYear']}>
              <input
                list="year-options"
                inputMode="numeric"
                className={`form-input ${
                  errors['companyDetails.latestRevenueYear'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.latestRevenueYear}
                onChange={(e) => setCD('latestRevenueYear', e.target.value)}
                placeholder="Search/select year"
              />
            </Field>

            <Field label="Net Revenue Increase From Last Year in Crore">
              <input
                className="form-input"
                readOnly
                value={netRevenue}
                placeholder="Auto calculated, can be negative"
              />
            </Field>

            <Field label="Latest Investment">
              <input
                className="form-input"
                value={form.companyDetails.latestInvestment}
                onChange={(e) => setCD('latestInvestment', e.target.value)}
              />
            </Field>

            <Field
              label="Latest Investment Year"
              error={errors['companyDetails.latestInvestmentYear']}
            >
              <input
                list="year-options"
                inputMode="numeric"
                className={`form-input ${
                  errors['companyDetails.latestInvestmentYear'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.latestInvestmentYear}
                onChange={(e) => setCD('latestInvestmentYear', e.target.value)}
                placeholder="Search/select year"
              />
            </Field>

            <Field label="Investment Taken From">
              <input
                className="form-input"
                value={form.companyDetails.investmentTakenFrom}
                onChange={(e) => setCD('investmentTakenFrom', e.target.value)}
              />
            </Field>

            <Field label="No. of Legal Cases" error={errors['companyDetails.legalCases']}>
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.legalCases'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.legalCases}
                onChange={(e) => setCD('legalCases', toNumberOrBlank(e.target.value))}
              />
            </Field>

            <Field
              label="No. of High Risk Legal Cases"
              error={errors['companyDetails.highRiskLegalCases']}
            >
              <input
                type="number"
                min="0"
                className={`form-input ${
                  errors['companyDetails.highRiskLegalCases'] ? 'input-error' : ''
                }`}
                value={form.companyDetails.highRiskLegalCases}
                onChange={(e) => setCD('highRiskLegalCases', toNumberOrBlank(e.target.value))}
              />
            </Field>

            {Number(form.companyDetails.highRiskLegalCases || 0) > 0 && (
              <Field
                label="High Risk Cases Responded *"
                error={errors['companyDetails.highRiskCasesResponded']}
              >
                <input
                  type="number"
                  min="0"
                  className={`form-input ${
                    errors['companyDetails.highRiskCasesResponded'] ? 'input-error' : ''
                  }`}
                  value={form.companyDetails.highRiskCasesResponded}
                  onChange={(e) =>
                    setCD('highRiskCasesResponded', toNumberOrBlank(e.target.value))
                  }
                />
              </Field>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Devices Added Later</h2>
          <p className="mt-2 text-sm text-slate-500">
            Save the account first. After saving, use the Add Device button on the company card.
          </p>
        </section>

        {pageError ? (
          <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {pageError}
          </p>
        ) : null}

        <button disabled={saving} className="btn-primary w-full">
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Account'}
        </button>
      </form>
    </main>
  )
}
