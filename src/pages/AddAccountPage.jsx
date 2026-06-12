import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, CheckCircle2, Laptop, MapPin, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Field } from '../components/Field'
import webMeetingDemo from '../assets/web-meeting-demo.png'
import DeviceForm, { createEmptyDevice, validateDevice } from '../components/DeviceForm'
import {
  BUSINESS_OPPORTUNITIES,
  NO_POTENTIAL_REASONS,
  POTENTIAL_OPTIONS,
  TIME_FOR_FIRST_ORDER,
  YEAR_OPTIONS,
} from '../data/constants'
import { todayDDMMYY, uid } from '../utils/dateUtils'

const base = {
  companyName: '',
  contactPerson: '',
  mobile: '',
  email: '',
  city: '',
  businessOpportunityWeHave: '',
  referredBy: '',
  hasPotential: '',
  timeForFirstOrder: '',
  firstOrderMonths: 1,
  futurePotentialMonths: 1,
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
  saveriskAvailable: '',
  meetingType: '',
  meetingLatitude: '',
  meetingLongitude: '',
  meetingAccuracy: '',
  meetingLocationCapturedAt: '',
  meetingAddressNote: '',
  meetingAddress: '',
  meetingPhotoUrl: '',
  orderStatus: 'Pending',
  trackingStatus: 'Not Started',
  mainStatus: 'Prospecting',
  quotationSent: 'No',
  poSent: 'No',
  deliveryStatus: 'ND',
  approvalStatus: 'Draft',
  createdDate: todayDDMMYY(),
  actualClosureDate: '',
  remarks: '',
  isFrozen: false,
  devices: [],
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

function OptionGrid({ value, onChange, options, error }) {
  return (
    <div>
      <div className={`oval-option-grid ${error ? 'oval-error' : ''}`}>
        {options.map((option) => (
          <button
            key={option.code || option}
            type="button"
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

export default function AddAccountPage({ onSave }) {
  const nav = useNavigate()
  const [form, setForm] = useState(base)
  const [step, setStep] = useState('visit')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [meetingProofSaved, setMeetingProofSaved] = useState(false)
  const onsiteCameraRef = useRef(null)
  const webPhotoRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('environment')
  const [cameraError, setCameraError] = useState('')
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [draftDevice, setDraftDevice] = useState(null)
  const [deviceError, setDeviceError] = useState('')
  const [deviceErrors, setDeviceErrors] = useState({})

  const meetingProofComplete = Boolean(
    form.meetingLatitude && form.meetingLongitude && form.meetingAddress && form.meetingType && photoPreview,
  )

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const setCD = (key, value) => {
    setForm((prev) => ({ ...prev, companyDetails: { ...prev.companyDetails, [key]: value } }))
    setErrors((prev) => ({ ...prev, [`companyDetails.${key}`]: '' }))
  }

  const netEmployees = useMemo(() => {
    const current = form.companyDetails.currentEmployees
    const previous = form.companyDetails.employeesSixMonthsBefore
    if (current === '' || previous === '') return ''
    return Number(current) - Number(previous)
  }, [form.companyDetails.currentEmployees, form.companyDetails.employeesSixMonthsBefore])

  const netRevenue = useMemo(() => {
    if (form.companyDetails.latestRevenueCrore === '' && form.companyDetails.previousYearRevenue === '') return ''
    return Number(form.companyDetails.latestRevenueCrore || 0) - Number(form.companyDetails.previousYearRevenue || 0)
  }, [form.companyDetails.latestRevenueCrore, form.companyDetails.previousYearRevenue])

  const buildPreciseAddress = (address = {}) => {
    const houseAndRoad = [
      address.house_number,
      address.building,
      address.office,
      address.road,
    ].filter(Boolean).join(' ')

    const laneOrArea = [
      address.neighbourhood,
      address.suburb,
      address.quarter,
    ].filter(Boolean).join(', ')

    const city = address.city || address.town || address.village || address.municipality || address.county
    const statePin = [address.postcode, address.state].filter(Boolean).join(', ')

    return [houseAndRoad, laneOrArea, city, statePin].filter(Boolean).join(', ')
  }

  const reverseGeocode = async (latitude, longitude) => {
    // Free reverse geocoding only. No Google Cloud key, billing, or payment details needed.
    // OpenStreetMap usually gives the most detailed free street/building-style address when data is available.
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      )
      if (!response.ok) throw new Error('Address lookup failed')
      const data = await response.json()
      const preciseAddress = buildPreciseAddress(data.address || {})
      const displayName = data.display_name || ''
      if (displayName && displayName.length > preciseAddress.length) return displayName
      return preciseAddress || displayName || `Location captured near ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    } catch {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        )
        if (!response.ok) throw new Error('Address lookup failed')
        const data = await response.json()
        const parts = [
          data.locality,
          data.city || data.localityInfo?.administrative?.find((item) => item.order === 6)?.name,
          data.principalSubdivision,
          data.postcode,
          data.countryName,
        ].filter(Boolean)
        return data.displayName || parts.join(', ') || `Location captured near ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
      } catch {
        return `Location captured near ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
      }
    }
  }

  const captureLocation = () => {
    setLocationLoading(true)
    setPageError('')

    if (!navigator.geolocation) {
      setPageError('Live precise location is not supported in this browser.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const address = await reverseGeocode(latitude, longitude)

        setForm((prev) => ({
          ...prev,
          meetingLatitude: latitude,
          meetingLongitude: longitude,
          meetingAccuracy: position.coords.accuracy,
          meetingLocationCapturedAt: new Date().toLocaleString('en-IN'),
          meetingAddress: address,
          meetingAddressNote: address,
        }))
        setErrors((prev) => ({ ...prev, meetingLocation: '' }))
        setLocationLoading(false)
      },
      (error) => {
        let message = error.message || 'Unable to capture live precise location.'
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          message = 'Camera/location requires HTTPS. Please open the app on HTTPS domain.'
        }
        setPageError(message)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    )
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }
    setCameraStream(null)
    setCameraOpen(false)
  }

  const startOnsiteCamera = async (facing = cameraFacing) => {
    setCameraError('')
    setPageError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser. Please use mobile Chrome on HTTPS or localhost.')
      onsiteCameraRef.current?.click()
      return
    }

    try {
      if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setCameraFacing(facing)
      setCameraStream(stream)
      setCameraOpen(true)
    } catch (error) {
      const message = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
        ? 'Camera requires HTTPS domain or localhost.'
        : error.message || 'Unable to open camera.'
      setCameraError(message)
      setPageError(message)
    }
  }

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play?.().catch(() => {})
    }
  }, [cameraStream])

  useEffect(() => () => {
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  const captureCameraPhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setPhoto(null)
    setPhotoPreview(dataUrl)
    setErrors((prev) => ({ ...prev, meetingPhoto: '' }))
    stopCamera()
  }

  const choosePhoto = async (e) => {
    const selectedPhoto = e.target.files?.[0]
    if (!selectedPhoto) return
    setPhoto(selectedPhoto)
    setPhotoPreview(await fileToBase64(selectedPhoto))
    setErrors((prev) => ({ ...prev, meetingPhoto: '' }))
  }

  const selectMeetingType = (value) => {
    set('meetingType', value)
    setPhoto(null)
    setPhotoPreview('')
    setErrors((prev) => ({ ...prev, meetingType: '', meetingPhoto: '' }))
    setPageError('')

    if (value === 'ONSITE') {
      requestAnimationFrame(() => startOnsiteCamera('environment'))
    }
  }

  const openMeetingCamera = () => {
    setPageError('')
    if (!form.meetingType) {
      setErrors((prev) => ({ ...prev, meetingType: 'Select onsite meeting or web meeting first.' }))
      return
    }
    if (form.meetingType === 'WEB') webPhotoRef.current?.click()
    else startOnsiteCamera(cameraFacing)
  }

  const saveMeetingProof = () => {
    const nextErrors = validateMeetingProof()

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setPageError('Precise address and meeting proof image are mandatory before filling company details.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setMeetingProofSaved(true)
    setPageError('')
    setStep('menu')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setDevices = (devices) => setForm((prev) => ({ ...prev, devices }))

  const validateMeetingProof = () => {
    const nextErrors = {}
    if (!form.meetingLatitude || !form.meetingLongitude) nextErrors.meetingLocation = 'Live precise location is required.'
    if (!form.meetingAddress) nextErrors.meetingLocation = 'Precise address is required. Please capture live precise location again.'
    if (!form.meetingType) nextErrors.meetingType = 'Select onsite meeting or web meeting.'
    if (!photoPreview) nextErrors.meetingPhoto = form.meetingType === 'WEB' ? 'Calendar meeting photo is mandatory.' : 'Meeting photograph is mandatory.'
    return nextErrors
  }

  const validateBasicDetails = () => {
    const nextErrors = {}
    if (!String(form.companyName || '').trim()) nextErrors.companyName = 'Company Name is required.'
    if (!String(form.contactPerson || '').trim()) nextErrors.contactPerson = 'Contact Person is required.'
    if (!String(form.mobile || '').trim()) nextErrors.mobile = 'Mobile is required.'
    if (!String(form.email || '').trim()) nextErrors.email = 'Email is required.'
    if (!String(form.city || '').trim()) nextErrors.city = 'City is required.'
    if (!String(form.referredBy || '').trim()) nextErrors.referredBy = 'Referred By is required.'
    if (!String(form.companyDetails.headquarterLocation || '').trim()) nextErrors['companyDetails.headquarterLocation'] = 'Headquarter Location is required.'
    if (!form.businessOpportunityWeHave) nextErrors.businessOpportunityWeHave = 'Business Opportunity for C Prompt is required.'
    if (!form.saveriskAvailable) nextErrors.saveriskAvailable = 'Select whether data is available in Saverisk.'

    if (form.businessOpportunityWeHave === 'UNKNOWN') {
      if (!String(form.unknownContactName || '').trim()) nextErrors.unknownContactName = 'Decision maker name is required.'
      if (!String(form.unknownContactDesignation || '').trim()) nextErrors.unknownContactDesignation = 'Decision maker designation is required.'
      if (!String(form.unknownContactPhone || '').trim()) nextErrors.unknownContactPhone = 'Decision maker phone is required.'
      if (!String(form.unknownContactEmail || '').trim()) nextErrors.unknownContactEmail = 'Decision maker email is required.'
    }
    return nextErrors
  }

  const validateOpportunityDetails = () => {
    const nextErrors = {}
    if (!form.hasPotential) nextErrors.hasPotential = 'Select business potential for C Prompt.'

    if (form.hasPotential === 'IMMEDIATE') {
      if (!form.timeForFirstOrder) nextErrors.timeForFirstOrder = 'Time for First Order is required.'
      ;['expectedQtyFirstOrder', 'expectedQty3Months', 'expectedQty6Months', 'expectedQty9Months', 'expectedQty12Months'].forEach((key) => {
        if (form[key] === '') nextErrors[key] = 'This field is required.'
        else if (!nonNegativeOrBlank(form[key])) nextErrors[key] = 'Value cannot be negative.'
      })
    }

    if (form.hasPotential === 'FUTURE') {
      if (!form.futurePotentialMonths) nextErrors.futurePotentialMonths = 'Future potential month is required.'
    }

    if (form.hasPotential === 'NO') {
      if (!form.noPotentialReason) nextErrors.noPotentialReason = 'Reason is required.'
      if (form.noPotentialReason === 'Company Buy' && !form.shownLeaseVsBuyCalculator) nextErrors.shownLeaseVsBuyCalculator = 'Select Yes or No.'
      if (form.noPotentialReason === 'C Prompt does not offer the product' && !String(form.wantedProduct || '').trim()) nextErrors.wantedProduct = 'Enter what they want.'
      if (form.noPotentialReason === 'Price mismatch') {
        if (form.mismatchPriceAmount === '') nextErrors.mismatchPriceAmount = 'Mismatch price amount is required.'
        else if (!nonNegativeOrBlank(form.mismatchPriceAmount)) nextErrors.mismatchPriceAmount = 'Amount cannot be negative.'
        if (String(form.mismatchReason || '').trim().length < 25) nextErrors.mismatchReason = 'Mismatch reason must be minimum 25 characters.'
      }
      if (form.noPotentialReason === 'Others' && !String(form.otherReason || '').trim()) nextErrors.otherReason = 'Other reason is required.'
    }

    return nextErrors
  }

  const validateRevenueDetails = () => {
    const nextErrors = {}
    if (form.companyDetails.revenueTwoYearsBefore === '') nextErrors['companyDetails.revenueTwoYearsBefore'] = 'Revenue 2 Years Before is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.revenueTwoYearsBefore)) nextErrors['companyDetails.revenueTwoYearsBefore'] = 'Revenue cannot be negative.'
    if (form.companyDetails.previousYearRevenue === '') nextErrors['companyDetails.previousYearRevenue'] = 'Previous Year Revenue is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.previousYearRevenue)) nextErrors['companyDetails.previousYearRevenue'] = 'Revenue cannot be negative.'
    if (form.companyDetails.latestRevenueCrore === '') nextErrors['companyDetails.latestRevenueCrore'] = 'Latest Revenue is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.latestRevenueCrore)) nextErrors['companyDetails.latestRevenueCrore'] = 'Revenue cannot be negative.'
    if (!form.companyDetails.latestRevenueYear) nextErrors['companyDetails.latestRevenueYear'] = 'Latest Revenue Year is required.'
    else if (!validYearOrBlank(form.companyDetails.latestRevenueYear)) nextErrors['companyDetails.latestRevenueYear'] = 'Select a year between 1990 and 2026.'
    if (!String(form.companyDetails.latestInvestment || '').trim()) nextErrors['companyDetails.latestInvestment'] = 'Latest Investment is required.'
    if (!form.companyDetails.latestInvestmentYear) nextErrors['companyDetails.latestInvestmentYear'] = 'Latest Investment Year is required.'
    else if (!validYearOrBlank(form.companyDetails.latestInvestmentYear)) nextErrors['companyDetails.latestInvestmentYear'] = 'Select a year between 1990 and 2026.'
    if (!String(form.companyDetails.investmentTakenFrom || '').trim()) nextErrors['companyDetails.investmentTakenFrom'] = 'Investment Taken From is required.'
    return nextErrors
  }

  const validateEmployeeDetails = () => {
    const nextErrors = {}
    if (!form.companyDetails.yearOfEstablishment) nextErrors['companyDetails.yearOfEstablishment'] = 'Year of Establishment is required.'
    else if (!validYearOrBlank(form.companyDetails.yearOfEstablishment)) nextErrors['companyDetails.yearOfEstablishment'] = 'Select a year between 1990 and 2026.'
    if (form.companyDetails.currentEmployees === '') nextErrors['companyDetails.currentEmployees'] = 'Current Employees is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.currentEmployees)) nextErrors['companyDetails.currentEmployees'] = 'Current Employees cannot be negative.'
    if (form.companyDetails.employeesSixMonthsBefore === '') nextErrors['companyDetails.employeesSixMonthsBefore'] = 'Employees 6 Months Before is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.employeesSixMonthsBefore)) nextErrors['companyDetails.employeesSixMonthsBefore'] = 'Employees cannot be negative.'
    if (form.companyDetails.legalCases === '') nextErrors['companyDetails.legalCases'] = 'No. of Legal Cases is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.legalCases)) nextErrors['companyDetails.legalCases'] = 'Legal Cases cannot be negative.'
    if (form.companyDetails.highRiskLegalCases === '') nextErrors['companyDetails.highRiskLegalCases'] = 'No. of High Risk Legal Cases is required.'
    else if (!nonNegativeOrBlank(form.companyDetails.highRiskLegalCases)) nextErrors['companyDetails.highRiskLegalCases'] = 'High Risk Legal Cases cannot be negative.'
    if (Number(form.companyDetails.highRiskLegalCases || 0) > 0 && form.companyDetails.highRiskCasesResponded === '') {
      nextErrors['companyDetails.highRiskCasesResponded'] = 'High Risk Cases Responded is required.'
    }
    return nextErrors
  }

  const saveSectionAndReturn = (validator, message) => {
    const nextErrors = validator()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setPageError(message || 'Please fill all mandatory fields before saving this section.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setPageError('')
    setStep('menu')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validate = () => {
    const nextErrors = {
      ...validateMeetingProof(),
      ...validateBasicDetails(),
      ...validateOpportunityDetails(),
    }

    if (form.saveriskAvailable === 'Yes') {
      Object.assign(nextErrors, validateRevenueDetails(), validateEmployeeDetails())
    }

    const hasInvalidDevice = (form.devices || []).some((device) => Object.keys(validateDevice(device)).length > 0)
    if (hasInvalidDevice) nextErrors.devices = 'Please correct product field errors before submitting.'

    return nextErrors
  }

  const save = async () => {
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setPageError('Please correct the specific missing / incorrect fields shown below.')
      return
    }

    setSaving(true)
    setPageError('')
    try {
      await onSave({
        ...form,
        accountId: uid('ACC'),
        accountType: 'N',
        meetingPhotoBase64: photoPreview,
        meetingPhotoName: photo?.name || `${form.companyName || 'meeting'}.jpg`,
        companyDetails: {
          ...form.companyDetails,
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

  const openProductForm = () => {
    setDraftDevice(createEmptyDevice())
    setProductFormOpen(true)
    setDeviceError('')
    setDeviceErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveProductDetails = () => {
    const deviceErrors = validateDevice(draftDevice || {})
    if (Object.keys(deviceErrors).length > 0) {
      setDeviceErrors(deviceErrors)
      setDeviceError('Please correct the specific missing / incorrect product fields shown below.')
      return
    }

    setDevices([...(form.devices || []), draftDevice])
    setProductFormOpen(false)
    setDraftDevice(null)
    setDeviceError('')
    setDeviceErrors({})
    setStep('menu')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const menuSections = [
    ['basic', 'Company Basic Details'],
    ['opportunity', 'Business Opportunity'],
    ...(form.saveriskAvailable === 'Yes'
      ? [
          ['revenue', 'Company Revenue Details'],
          ['employees', 'Company Employee Details'],
        ]
      : []),
    ['devices', 'Products'],
  ]

  const openSection = (targetStep) => {
    if (!meetingProofSaved) return
    setPageError('')
    setProductFormOpen(false)
    setDraftDevice(null)
    setDeviceError('')
    setStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <datalist id="year-options">{YEAR_OPTIONS.map((year) => <option key={year} value={year} />)}</datalist>

      <button type="button" onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-5">
        <h1 className="text-3xl font-black">Add Account</h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-500">
          Please provide 100% accurate information. No spelling mistake, no wrong data. Take your time and please check twice before entering.
        </p>
      </div>

      {pageError ? <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{pageError}</p> : null}
      <ErrorSummary errors={errors} />

      {cameraOpen ? (
        <div className="camera-modal" role="dialog" aria-modal="true">
          <div className="camera-modal-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-950">Take onsite meeting photo</h3>
              <button type="button" className="btn-secondary !py-2" onClick={stopCamera}>Close</button>
            </div>
            {cameraError ? <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{cameraError}</p> : null}
            <video ref={videoRef} className="camera-video" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="hidden" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn-secondary" onClick={() => startOnsiteCamera(cameraFacing === 'environment' ? 'user' : 'environment')}>
                Switch Camera
              </button>
              <button type="button" className="btn-primary" onClick={captureCameraPhoto}>
                <Camera size={18} /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 'menu' && meetingProofSaved ? (
        <section className="card section-menu-card">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="section-title">What do you want to fill?</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Meeting proof is completed. Open one section, save it, and you will come back here.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-black text-green-700">
              <CheckCircle2 size={16} /> Meeting Proof Saved
            </span>
          </div>

          <div className="section-button-nav section-menu-buttons">
            {menuSections.map(([key, label]) => (
              <button key={key} type="button" onClick={() => openSection(key)}>
                {label}
              </button>
            ))}
          </div>

          {form.saveriskAvailable !== 'Yes' ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
              Company Revenue Details and Company Employee Details buttons will show only when “Is the data available in Saverisk?” is selected as Yes in Company Basic Details.
            </p>
          ) : null}

          <div className="section-save-row">
            <button disabled={saving} type="button" onClick={save} className="btn-primary">
              <Save size={18} /> {saving ? 'Saving...' : 'Submit Account'}
            </button>
          </div>
        </section>
      ) : null}

      {step === 'visit' && (
        <section className="card">
          <h2 className="section-title">Meeting Proof Location</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Capture live precise location first. This field is locked and cannot be edited manually.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className={`rounded-3xl border p-4 ${errors.meetingLocation ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <button type="button" onClick={captureLocation} disabled={locationLoading} className="btn-primary w-full">
                <MapPin size={18} /> {locationLoading ? 'Capturing...' : 'Capture Live Precise Location'}
              </button>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
                <p>Address: <span className="text-slate-950">{locationLoading ? 'Fetching address...' : form.meetingAddress || '-'}</span></p>
                <p>Accuracy: <span className="text-slate-950">{form.meetingAccuracy ? `${Math.round(form.meetingAccuracy)} meters` : '-'}</span></p>
                <p>Captured At: <span className="text-slate-950">{form.meetingLocationCapturedAt || '-'}</span></p>
              </div>
              {errors.meetingLocation ? <p className="field-error">{errors.meetingLocation}</p> : null}
            </div>

            <div>
              <Field label="Meeting Type *" error={errors.meetingType}>
                <OptionGrid
                  value={form.meetingType}
                  error={errors.meetingType}
                  onChange={selectMeetingType}
                  options={[
                    { code: 'ONSITE', label: 'Onsite Meeting' },
                    { code: 'WEB', label: 'Web Meeting' },
                  ]}
                />
              </Field>

              <input ref={onsiteCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={choosePhoto} />
              <input ref={webPhotoRef} type="file" accept="image/*" className="hidden" onChange={choosePhoto} />
              {form.meetingType === 'WEB' ? (
                <div className="web-meeting-guide mt-4">
                  <p className="text-sm font-black text-slate-900">Upload this type of calendar / Google Meet screenshot *</p>
                  <img src={webMeetingDemo} alt="Web meeting calendar example" className="web-meeting-demo-img" />
                </div>
              ) : null}

              <button type="button" onClick={openMeetingCamera} className="meeting-proof-upload mt-4">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  {form.meetingType === 'WEB' ? <Upload /> : <Camera />}
                </span>
                <span className="mt-3 block font-black text-slate-900">
                  {form.meetingType === 'WEB' ? 'Choose calendar meeting photo *' : 'Open camera and take meeting photo *'}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {form.meetingType === 'WEB'
                    ? 'Please upload the Google Calendar or Google Meet meeting screenshot.'
                    : 'Onsite meeting will open your phone camera. Use HTTPS or localhost.'}
                </span>
              </button>
              {errors.meetingPhoto ? <p className="field-error">{errors.meetingPhoto}</p> : null}
              {photoPreview ? <img src={photoPreview} alt="Meeting proof preview" className="meeting-photo-img mt-4" /> : null}
            </div>
          </div>

          <div className="section-save-row">
            <button type="button" className="btn-primary" onClick={saveMeetingProof}>
              Save Details
            </button>
          </div>
        </section>
      )}

      {step === 'basic' && (
        <section className="card">
          <h2 className="section-title">Company Basic Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Company Name *" error={errors.companyName}><input className={`form-input ${errors.companyName ? 'input-error' : ''}`} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} /></Field>
            <Field label="Contact Person *" error={errors.contactPerson}><input className={`form-input ${errors.contactPerson ? 'input-error' : ''}`} value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} /></Field>
            <Field label="Mobile *" error={errors.mobile}><input className={`form-input ${errors.mobile ? 'input-error' : ''}`} value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} /></Field>
            <Field label="Email *" error={errors.email}><input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="City *" error={errors.city}><input className={`form-input ${errors.city ? 'input-error' : ''}`} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field label="Headquarter Location *" error={errors['companyDetails.headquarterLocation']}><input className={`form-input ${errors['companyDetails.headquarterLocation'] ? 'input-error' : ''}`} value={form.companyDetails.headquarterLocation} onChange={(e) => setCD('headquarterLocation', e.target.value)} /></Field>
            <Field label="Referred By *" error={errors.referredBy}><input className={`form-input ${errors.referredBy ? 'input-error' : ''}`} value={form.referredBy} onChange={(e) => set('referredBy', e.target.value)} /></Field>
          </div>

          <div className="mt-4">
            <Field label="Business Opportunity for C Prompt *" error={errors.businessOpportunityWeHave}>
              <OptionGrid value={form.businessOpportunityWeHave} error={errors.businessOpportunityWeHave} onChange={(value) => set('businessOpportunityWeHave', value)} options={BUSINESS_OPPORTUNITIES.map((item) => ({ ...item, label: item.code === 'UNKNOWN' ? `${form.contactPerson || 'Contact Person'} is not a decision maker` : item.label }))} />
            </Field>
          </div>

          {form.businessOpportunityWeHave === 'UNKNOWN' ? (
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-black text-amber-900">Decision Maker Details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Name *" error={errors.unknownContactName}><input className={`form-input ${errors.unknownContactName ? 'input-error' : ''}`} value={form.unknownContactName} onChange={(e) => set('unknownContactName', e.target.value)} /></Field>
                <Field label="Designation *" error={errors.unknownContactDesignation}><input className={`form-input ${errors.unknownContactDesignation ? 'input-error' : ''}`} value={form.unknownContactDesignation} onChange={(e) => set('unknownContactDesignation', e.target.value)} /></Field>
                <Field label="Phone No *" error={errors.unknownContactPhone}><input className={`form-input ${errors.unknownContactPhone ? 'input-error' : ''}`} value={form.unknownContactPhone} onChange={(e) => set('unknownContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} /></Field>
                <Field label="Email"><input className="form-input" type="email" value={form.unknownContactEmail} onChange={(e) => set('unknownContactEmail', e.target.value)} /></Field>
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <Field label="Is the data available in Saverisk? *" error={errors.saveriskAvailable}>
              <OptionGrid value={form.saveriskAvailable} error={errors.saveriskAvailable} onChange={(value) => set('saveriskAvailable', value)} options={['Yes', 'No']} />
            </Field>
          </div>

          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateBasicDetails, 'Please fill all mandatory company basic details before saving.')}>Save Details</button></div>
        </section>
      )}

      {step === 'opportunity' && (
        <section className="card">
          <h2 className="section-title">What is the business potentials for C Prompt?</h2>
          <div className="mt-4">
            <OptionGrid value={form.hasPotential} error={errors.hasPotential} onChange={(value) => { set('hasPotential', value); if (value === 'IMMEDIATE' && !form.timeForFirstOrder) set('timeForFirstOrder', 'Within 1 month') }} options={POTENTIAL_OPTIONS} />
          </div>

          {form.hasPotential === 'IMMEDIATE' ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Time for First Order *" error={errors.timeForFirstOrder}>
                <div className={`slider-card ${errors.timeForFirstOrder ? 'input-error' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-600">Expected first order timeline</span>
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-700">
                      {form.firstOrderMonths} month{Number(form.firstOrderMonths) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={form.firstOrderMonths}
                    onChange={(e) => {
                      const months = Number(e.target.value)
                      set('firstOrderMonths', months)
                      set('timeForFirstOrder', `Within ${months} month${months > 1 ? 's' : ''}`)
                    }}
                    className="mt-4 w-full"
                  />
                  <p className="mt-2 text-xs font-semibold text-slate-500">Slide from 1 to 12 months.</p>
                </div>
              </Field>
              <Field label="Expected Qty First Order" error={errors.expectedQtyFirstOrder}><input type="number" min="0" className="form-input" value={form.expectedQtyFirstOrder} onChange={(e) => set('expectedQtyFirstOrder', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 3 Months" error={errors.expectedQty3Months}><input type="number" min="0" className="form-input" value={form.expectedQty3Months} onChange={(e) => set('expectedQty3Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 6 Months" error={errors.expectedQty6Months}><input type="number" min="0" className="form-input" value={form.expectedQty6Months} onChange={(e) => set('expectedQty6Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 9 Months" error={errors.expectedQty9Months}><input type="number" min="0" className="form-input" value={form.expectedQty9Months} onChange={(e) => set('expectedQty9Months', toNumberOrBlank(e.target.value))} /></Field>
              <Field label="Expected Qty 12 Months" error={errors.expectedQty12Months}><input type="number" min="0" className="form-input" value={form.expectedQty12Months} onChange={(e) => set('expectedQty12Months', toNumberOrBlank(e.target.value))} /></Field>
            </div>
          ) : null}

          {form.hasPotential === 'FUTURE' ? (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-black">Future potential timeline</h3>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-brand-700">{form.futurePotentialMonths} month{Number(form.futurePotentialMonths) > 1 ? 's' : ''}</span>
              </div>
              <input type="range" min="1" max="12" value={form.futurePotentialMonths} onChange={(e) => set('futurePotentialMonths', Number(e.target.value))} className="mt-5 w-full" />
            </div>
          ) : null}

          {form.hasPotential === 'NO' ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Reason *" error={errors.noPotentialReason}>
                <select className={`form-input ${errors.noPotentialReason ? 'input-error' : ''}`} value={form.noPotentialReason} onChange={(e) => set('noPotentialReason', e.target.value)}>
                  <option value="">Select</option>
                  {NO_POTENTIAL_REASONS.map((item) => <option key={item} value={item}>{item === 'Company Buy' ? `${form.companyName || 'Company'} Company Buy` : item}</option>)}
                </select>
              </Field>
              {form.noPotentialReason === 'Company Buy' ? (
                <Field label="Shown Calculator & Presentation of Lease vs Buy? *" error={errors.shownLeaseVsBuyCalculator}>
                  <select className={`form-input ${errors.shownLeaseVsBuyCalculator ? 'input-error' : ''}`} value={form.shownLeaseVsBuyCalculator} onChange={(e) => set('shownLeaseVsBuyCalculator', e.target.value)}><option value="">Select</option><option>Yes</option><option>No</option></select>
                </Field>
              ) : null}
              {form.noPotentialReason === 'C Prompt does not offer the product' ? (
                <Field label="What they want *" error={errors.wantedProduct}><input className={`form-input ${errors.wantedProduct ? 'input-error' : ''}`} value={form.wantedProduct} onChange={(e) => set('wantedProduct', e.target.value)} /></Field>
              ) : null}
              {form.noPotentialReason === 'Price mismatch' ? (
                <>
                  <Field label="Mismatch Price Amount *" error={errors.mismatchPriceAmount}><input type="number" min="0" className={`form-input ${errors.mismatchPriceAmount ? 'input-error' : ''}`} value={form.mismatchPriceAmount} onChange={(e) => set('mismatchPriceAmount', toNumberOrBlank(e.target.value))} /></Field>
                  <Field label="Mismatch Reason *" error={errors.mismatchReason}><textarea rows="4" className={`form-input ${errors.mismatchReason ? 'input-error' : ''}`} value={form.mismatchReason} onChange={(e) => set('mismatchReason', e.target.value)} /></Field>
                </>
              ) : null}
              {form.noPotentialReason === 'Others' ? (
                <Field label="Other Reason *" error={errors.otherReason}><textarea rows="4" className={`form-input ${errors.otherReason ? 'input-error' : ''}`} value={form.otherReason} onChange={(e) => set('otherReason', e.target.value)} /></Field>
              ) : null}
            </div>
          ) : null}

          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateOpportunityDetails, 'Please fill all mandatory business opportunity details before saving.')}>Save Details</button></div>
        </section>
      )}

      {step === 'revenue' && form.saveriskAvailable === 'Yes' && (
        <section className="card">
          <h2 className="section-title">Company Revenue Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Revenue 2 Years Before in Crore *" error={errors['companyDetails.revenueTwoYearsBefore']}><input type="number" min="0" className="form-input" value={form.companyDetails.revenueTwoYearsBefore} onChange={(e) => setCD('revenueTwoYearsBefore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Previous Year Revenue in Crore *" error={errors['companyDetails.previousYearRevenue']}><input type="number" min="0" className="form-input" value={form.companyDetails.previousYearRevenue} onChange={(e) => setCD('previousYearRevenue', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Latest Revenue in Crore *" error={errors['companyDetails.latestRevenueCrore']}><input type="number" min="0" className="form-input" value={form.companyDetails.latestRevenueCrore} onChange={(e) => setCD('latestRevenueCrore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Latest Revenue Year *" error={errors['companyDetails.latestRevenueYear']}><input list="year-options" inputMode="numeric" className="form-input" value={form.companyDetails.latestRevenueYear} onChange={(e) => setCD('latestRevenueYear', e.target.value)} /></Field>
            <Field label="Latest Investment *" error={errors['companyDetails.latestInvestment']}><input className={`form-input ${errors['companyDetails.latestInvestment'] ? 'input-error' : ''}`} value={form.companyDetails.latestInvestment} onChange={(e) => setCD('latestInvestment', e.target.value)} /></Field>
            <Field label="Latest Investment Year *" error={errors['companyDetails.latestInvestmentYear']}><input list="year-options" inputMode="numeric" className={`form-input ${errors['companyDetails.latestInvestmentYear'] ? 'input-error' : ''}`} value={form.companyDetails.latestInvestmentYear} onChange={(e) => setCD('latestInvestmentYear', e.target.value)} /></Field>
            <Field label="Investment Taken From *" error={errors['companyDetails.investmentTakenFrom']}><input className={`form-input ${errors['companyDetails.investmentTakenFrom'] ? 'input-error' : ''}`} value={form.companyDetails.investmentTakenFrom} onChange={(e) => setCD('investmentTakenFrom', e.target.value)} /></Field>
          </div>
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateRevenueDetails, 'Please correct company revenue details before saving.')}>Save Details</button></div>
        </section>
      )}

      {step === 'employees' && form.saveriskAvailable === 'Yes' && (
        <section className="card">
          <h2 className="section-title">Company Employee Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Year of Establishment *" error={errors['companyDetails.yearOfEstablishment']}><input list="year-options" inputMode="numeric" className="form-input" value={form.companyDetails.yearOfEstablishment} onChange={(e) => setCD('yearOfEstablishment', e.target.value)} /></Field>
            <Field label="Current Employees *" error={errors['companyDetails.currentEmployees']}><input type="number" min="0" className="form-input" value={form.companyDetails.currentEmployees} onChange={(e) => setCD('currentEmployees', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="Employees 6 Months Before *" error={errors['companyDetails.employeesSixMonthsBefore']}><input type="number" min="0" className="form-input" value={form.companyDetails.employeesSixMonthsBefore} onChange={(e) => setCD('employeesSixMonthsBefore', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="No. of Legal Cases *" error={errors['companyDetails.legalCases']}><input type="number" min="0" className={`form-input ${errors['companyDetails.legalCases'] ? 'input-error' : ''}`} value={form.companyDetails.legalCases} onChange={(e) => setCD('legalCases', toNumberOrBlank(e.target.value))} /></Field>
            <Field label="No. of High Risk Legal Cases *" error={errors['companyDetails.highRiskLegalCases']}><input type="number" min="0" className={`form-input ${errors['companyDetails.highRiskLegalCases'] ? 'input-error' : ''}`} value={form.companyDetails.highRiskLegalCases} onChange={(e) => setCD('highRiskLegalCases', toNumberOrBlank(e.target.value))} /></Field>
          </div>
          <div className="section-save-row"><button type="button" className="btn-primary" onClick={() => saveSectionAndReturn(validateEmployeeDetails, 'Please correct company employee details before saving.')}>Save Details</button></div>
        </section>
      )}

      {step === 'devices' && (
        <section className="grid gap-4">
          {!productFormOpen ? (
            <>
              <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="section-title">Products</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Add product only if the user wants to add now. Products can also be added later from the company card.
                  </p>
                </div>
                <button type="button" className="btn-secondary" onClick={openProductForm}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {errors.devices ? <p className="field-error">{errors.devices}</p> : null}

              {(form.devices || []).length > 0 ? (
                <div className="grid gap-3">
                  {(form.devices || []).map((device, index) => (
                    <div key={device.deviceId} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-900">Product {index + 1}: {device.brand} {device.deviceType}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {device.processor} • {device.ram} • {device.storage} • Qty {device.quantity || 0} • ₹{device.pricePerMonth || 0}/month
                        </p>
                      </div>
                      <button type="button" className="btn-danger" onClick={() => setDevices((form.devices || []).filter((_, i) => i !== index))}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-card">
                  <Laptop className="text-slate-400" />
                  <h3 className="mt-2 text-lg font-black">No product added</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">You can submit the account without product details.</p>
                </div>
              )}

              <button type="button" onClick={() => setStep('menu')} className="btn-primary w-full">
                Save Products & Back
              </button>
            </>
          ) : (
            <section className="card">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="section-title">Add Product Details</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Fill product details and save. You will return to the Products page after saving.</p>
                </div>
                <button type="button" className="btn-secondary" onClick={() => { setProductFormOpen(false); setDraftDevice(null); setDeviceError('') }}>
                  Back to Products
                </button>
              </div>
              {deviceError ? <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{deviceError}</p> : null}
              <ErrorSummary errors={deviceErrors} title="Product missing / incorrect fields:" />
              <DeviceForm
                device={draftDevice || createEmptyDevice()}
                onChange={(next) => { setDraftDevice(next); setDeviceError(''); setDeviceErrors({}) }}
                onRemove={() => {}}
                canRemove={false}
              />
              <div className="section-save-row">
                <button type="button" className="btn-primary" onClick={saveProductDetails}>Save Product Details</button>
              </div>
            </section>
          )}
        </section>
      )}

    </main>
  )
}
