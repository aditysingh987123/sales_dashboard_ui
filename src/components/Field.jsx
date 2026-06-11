import { Eye } from 'lucide-react'
import React from "react";

const HELP_TEXT = {
  'Account Type *': 'Choose New for a fresh lead or Existing when this company is already present. Existing lets the form reuse saved company data.',
  'Existing Company *': 'Select the saved company record. The form will autofill company, contact, and company detail fields from that record.',
  'Company Name *': 'The official or commonly used company name. This is the main account name shown in lists and reports.',
  'Contact Person *': 'The person who gave the opportunity details or is coordinating the discussion.',
  'Mobile *': 'Primary mobile number for follow-up, confirmation, and quick contact.',
  Email: 'Email address for quotation, commercial discussion, or formal follow-up.',
  City: 'City where the client, office, or opportunity is located.',
  'Referred By *': 'Source of this opportunity, such as CA partner, employee name, client reference, event, or campaign.',
  'Business Opportunity We Have *': 'Select the type of business opportunity available: Leasing, Renting, Hybrid, or that this contact does not know.',
  'Name *': 'Name of the correct person who can confirm the business opportunity when the current contact does not know.',
  Designation: 'Role of the person. This helps judge decision power and follow-up priority.',
  'Phone No *': 'Phone number of the correct contact or decision maker for this opportunity.',
  'Do we have potentials? *': 'Select Yes when the account can generate business. Select No when there is no active or future opportunity currently visible.',
  'Time for First Order *': 'Expected time by which the first order may come. This helps forecast short-term business.',
  'Expected Qty First Order': 'Expected device quantity for the first order. Use 0 when quantity is not clear yet.',
  'Expected Qty 3 Months': 'Expected total quantity possible within 3 months. Use 0 if there is no expected quantity.',
  'Expected Qty 6 Months': 'Expected total quantity possible within 6 months. Use 0 if there is no expected quantity.',
  'Expected Qty 9 Months': 'Expected total quantity possible within 9 months. Use 0 if there is no expected quantity.',
  'Expected Qty 12 Months': 'Expected total quantity possible within 12 months. Use 0 if there is no expected quantity.',
  'Reason *': 'Reason why this account has no potential right now. This helps management understand lost or blocked opportunities.',
  'Shown Calculator & Presentation of Lease vs Buy? *': 'Mark whether the lease-vs-buy calculator or presentation was shown before accepting that the client prefers buying.',
  'What they want *': 'Enter the product/service the client wants when we do not currently offer it.',
  'Mismatch Price Amount *': 'The price difference or amount because of which the client felt our offer did not match expectations.',
  'Mismatch Reason *': 'Detailed reason for price mismatch. Minimum 25 characters are required so the reason is useful.',
  'Other Reason *': 'Use this when the reason does not fit any available option.',
  'Order Status': 'Pending means order details are still editable. Complete means order was submitted and add/remove device actions are locked.',
  'Tracking Status': 'Current tracking progress. Send for approval is allowed only when this is In Progress.',
  Status: 'Main opportunity stage such as Prospecting, Negotiation, Won, or Lost.',
  'Approval Status': 'Approval stage for the opportunity. Quotation can be sent only after Approved.',
  'Quotation Sent': 'Set Yes only after approval. Once changed to Yes, it cannot be changed back to No.',
  'PO Sent': 'Set Yes only after quotation is sent. Once Yes, it cannot be changed back to No.',
  'Delivery Status': 'Delivery progress for the order. This should be updated only after the opportunity is Won.',
  'Actual Closure Date': 'Closure date captured when the opportunity becomes Won or Lost.',
  'Year Of Establishment': 'Company establishment year. Type to search/select any year from 1990 to 2026.',
  'Headquarter Location': 'Main headquarter location of the company. Helps understand company base and decision location.',
  'Current Employees': 'Latest employee count. This must be greater than or equal to Employees 6 Months Before.',
  'Employees 6 Months Before': 'Employee count six months ago. Used to calculate employee growth.',
  'Net Employees Last 6 Months': 'Auto-calculated as Current Employees minus Employees 6 Months Before. Negative value is not allowed.',
  'Revenue 2 Years Before in Crore': 'Revenue from two years before, entered in crore. Used to see revenue growth sequence.',
  'Previous Year Revenue in Crore': 'Previous year revenue in crore. Used with latest revenue to calculate increase/decrease.',
  'Latest Revenue in Crore': 'Latest available revenue in crore. Use the latest confirmed financial value.',
  'Latest Revenue Year': 'Financial year or calendar year for the latest available revenue. Type to search/select from 1990 to 2026.',
  'Net Revenue Increase From Last Year in Crore': 'Auto-calculated as Latest Revenue minus Previous Year Revenue. Negative value is allowed.',
  'Latest Investment': 'Latest investment amount or investment detail if known.',
  'Latest Investment Year': 'Year when the latest investment happened. Type to search/select from 1990 to 2026.',
  'Investment Taken From': 'Investor, funding source, bank, VC, PE, promoter, or institution from where investment was taken.',
  'No. of Legal Cases': 'Total legal cases. This number must be greater than or equal to high-risk legal cases.',
  'No. of High Risk Legal Cases': 'High-risk legal cases only. This cannot be greater than total legal cases.',
  'High Risk Cases Responded *': 'Number of high-risk cases where the company has already responded.',
  'Device Type *': 'Type of device required, such as Laptop, Desktop, Workstation, Tablet, Monitor, Printer, or Other.',
  'Condition *': 'Device condition required: New, Old Without Warranty, or Old With Warranty.',
  'Brand *': 'Preferred device brand. Select Others only when the required brand is not listed.',
  'Processor Brand *': 'Processor family. Apple devices automatically use Apple Silicon; non-Apple devices use Intel or AMD.',
  'Processor *': 'Processor model or series required for the device configuration.',
  Generation: 'Processor/device generation. This is hidden for Apple Silicon and shown for Intel/AMD.',
  'RAM *': 'Required memory size for the device.',
  'Storage *': 'Required storage size and type for the device.',
  'Graphic Card': 'Select Yes when dedicated graphics is required for design, rendering, AI, or heavy workloads.',
  'Quantity *': 'Number of devices required. It must be greater than zero.',
  'Lock-in Months *': 'Minimum lock-in period in months. It must be zero or more.',
  'Price Per Month *': 'Monthly price per device. It must be zero or more.',
  'Excluding GST': 'Confirms whether the price entered is excluding GST.',
  'Business Opportunity We Have': 'Read-only view of the selected opportunity type for this account.',
  'Referred By': 'Read-only view of the lead source or person who referred this opportunity.',
  'Time for First Order': 'Read-only view of expected time for first order.',
  'Total Quantity': 'Total device quantity across all devices added under this account.',
  'Monthly Value': 'Approximate monthly order value calculated from device quantity and monthly price.',
}

function cleanLabel(label = '') {
  return String(label).replace(/\s*\*\s*$/, '')
}

function fallbackHelp(label = '') {
  const name = cleanLabel(label)
  return `${name} is used to understand the client, qualify the opportunity, and keep the CRM data complete for follow-up and reporting.`
}

function HelpButton({ label, help, small = false }) {
  const helpText = help || HELP_TEXT[label] || HELP_TEXT[cleanLabel(label)] || fallbackHelp(label)

  return (
    <span className={`field-help-wrap ${small ? 'small' : ''}`}>
      <button
        type="button"
        className={`field-help-btn ${small ? 'small' : ''}`}
        aria-label={`Field help for ${cleanLabel(label)}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Eye size={small ? 12 : 14} />
      </button>
      <span className="field-help-tooltip" role="tooltip">
        <span className="field-help-title">{cleanLabel(label)}</span>
        <span className="field-help-text">{helpText}</span>
      </span>
    </span>
  )
}

export function Field({ label, error, children, help }) {
  return (
    <label className="field-shell">
      <span className="field-label-row">
        <span className="form-label">{label}</span>
        <HelpButton label={label} help={help} />
      </span>

      {error ? <p className="field-error">{error}</p> : null}
      {children}
    </label>
  )
}

export function InfoField({ label, value, help }) {
  return (
    <div className="info-field-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <HelpButton label={label} help={help} small />
      </div>
      <p className="mt-1 break-words text-sm font-black text-slate-900">{value || '-'}</p>
    </div>
  )
}
