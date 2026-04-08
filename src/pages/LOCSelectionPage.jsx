import { useState } from 'react'
import {
  Typography, Checkbox, DatePicker, Button, Alert, Radio, Tag,
} from 'antd'
import {
  MedicineBoxOutlined, SmileOutlined, EyeOutlined,
  BarChartOutlined, PlusOutlined, CloseOutlined,
  ShopOutlined, SafetyCertificateOutlined,
  RightOutlined, DownOutlined, CopyOutlined, LockOutlined,
  AlertOutlined, HeartOutlined, HomeOutlined,
  UserOutlined, TeamOutlined, ClockCircleOutlined, FieldTimeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const BASE_LOCS = [
  {
    key: 'MEDICAL',
    label: 'Medical',
    hex: '#1a56db',
    icon: <MedicineBoxOutlined />,
    carriers: [
      { key: 'ANTHEM', name: 'Anthem Blue Cross' },
      { key: 'AETNA',  name: 'Aetna' },
    ],
  },
  {
    key: 'DENTAL',
    label: 'Dental',
    hex: '#0e9f6e',
    icon: <SmileOutlined />,
    carriers: [{ key: 'DELTA', name: 'Delta Dental' }],
  },
  {
    key: 'VISION',
    label: 'Vision',
    hex: '#7e3af2',
    icon: <EyeOutlined />,
    carriers: [{ key: 'VSP', name: 'VSP' }],
  },
]

const ADDITIONAL_LOCS = [
  { key: 'ACCIDENT',          label: 'Accident',          hex: '#f97316', icon: <AlertOutlined />,              description: 'Worksite accident coverage' },
  { key: 'CRITICAL_ILLNESS',  label: 'Critical Illness',  hex: '#dc2626', icon: <HeartOutlined />,              description: 'Critical illness lump-sum benefit' },
  { key: 'HOSPITAL_INDEMNITY',label: 'Hospital Indemnity', hex: '#ec4899', icon: <HomeOutlined />,              description: 'Hospital confinement indemnity' },
  { key: 'BASIC_LIFE',        label: 'Basic Life',         hex: '#4f46e5', icon: <UserOutlined />,              description: 'Employer-paid basic life insurance' },
  { key: 'VOLUNTARY_LIFE',    label: 'Voluntary Life',     hex: '#7c3aed', icon: <TeamOutlined />,              description: 'Employee-elected voluntary life' },
  { key: 'ADD',               label: 'AD&D',               hex: '#64748b', icon: <SafetyCertificateOutlined />, description: 'Accidental death & dismemberment' },
  { key: 'STD',               label: 'STD',                hex: '#0d9488', icon: <ClockCircleOutlined />,       description: 'Short-term disability' },
  { key: 'LTD',               label: 'LTD',                hex: '#0891b2', icon: <FieldTimeOutlined />,         description: 'Long-term disability' },
]

const DISABLED_BEFORE = dayjs('2026-01-01')

export default function LOCSelectionPage({ onStartRenewal, onViewDashboard, lockedConfig = null, onCancel = null, preSelectedLocKey = null }) {
  // Carriers already in an active renewal — their rows are locked (can't be unchecked)
  const lockedCarrierIds = new Set(
    (lockedConfig || []).flatMap((loc) =>
      (loc.carriers || []).filter((c) => c.selected).map((c) => `${loc.key}.${c.key}`)
    )
  )

  const hasLocked = lockedCarrierIds.size > 0

  // LOC names already in an active renewal (for the warning banner)
  const activeRenewalLocNames = (lockedConfig || [])
    .filter((loc) => loc.carriers?.some((c) => c.selected))
    .map((loc) => loc.label)

  const [selections, setSelections] = useState(() =>
    Object.fromEntries(
      BASE_LOCS.flatMap((loc) =>
        loc.carriers.map((c) => {
          const k = `${loc.key}.${c.key}`
          if (lockedCarrierIds.has(k)) {
            const existingCarrier = (lockedConfig || [])
              .find((l) => l.key === loc.key)
              ?.carriers?.find((cc) => cc.key === c.key)
            return [k, { selected: true, date: existingCarrier?.effectiveDate ?? null }]
          }
          // Pre-select all carriers for the loc coming from the dashboard
          if (preSelectedLocKey && loc.key === preSelectedLocKey) {
            return [k, { selected: true, date: null }]
          }
          return [k, { selected: false, date: null }]
        })
      )
    )
  )
  const [expandedLocs, setExpandedLocs] = useState(
    preSelectedLocKey ? new Set([preSelectedLocKey]) : new Set()
  )
  const [addedKeys, setAddedKeys]       = useState([])
  const [addedSels, setAddedSels]       = useState({})
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [smallGroupMap, setSmallGroupMap] = useState({})

  // ── Derived ────────────────────────────────────────────────────────────────

  const locAny   = (loc) => loc.carriers.some((c) => selections[`${loc.key}.${c.key}`]?.selected)
  const locAll   = (loc) => loc.carriers.every((c) => selections[`${loc.key}.${c.key}`]?.selected)
  const locDates = (loc) => loc.carriers.every((c) => {
    const s = selections[`${loc.key}.${c.key}`]
    return !s?.selected || s?.date !== null
  })

  const anyBaseSelected      = BASE_LOCS.some(locAny)
  const anyAdded             = Object.values(addedSels).some((s) => s.selected)
  const anySelected          = anyBaseSelected || anyAdded
  const allSelectedHaveDates =
    BASE_LOCS.every(locDates) &&
    Object.values(addedSels).every((s) => !s.selected || s.date !== null)
  const hasAnySG    = Object.values(smallGroupMap).some((v) => v === 'yes')
  const canProceed  = anySelected && allSelectedHaveDates
  const skippedBase = BASE_LOCS.filter((loc) => !locAny(loc))
  const availableToAdd = ADDITIONAL_LOCS.filter((l) => !addedKeys.includes(l.key))

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleExpand = (key) =>
    setExpandedLocs((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const toggleCarrier = (locKey, carrierKey, checked) => {
    const k = `${locKey}.${carrierKey}`
    if (lockedCarrierIds.has(k)) return // can't toggle locked carriers
    setSelections((prev) => ({
      ...prev,
      [k]: { selected: checked, date: checked ? prev[k].date : null },
    }))
    if (checked) setExpandedLocs((prev) => new Set([...prev, locKey]))
  }

  const toggleAllCarriers = (loc, checked) => {
    setSelections((prev) => ({
      ...prev,
      ...Object.fromEntries(
        loc.carriers
          .filter((c) => !lockedCarrierIds.has(`${loc.key}.${c.key}`)) // skip locked
          .map((c) => {
            const k = `${loc.key}.${c.key}`
            return [k, { selected: checked, date: checked ? prev[k].date : null }]
          })
      ),
    }))
    if (checked) setExpandedLocs((prev) => new Set([...prev, loc.key]))
  }

  const setCarrierDate = (locKey, carrierKey, date) => {
    const k = `${locKey}.${carrierKey}`
    setSelections((prev) => ({ ...prev, [k]: { ...prev[k], date } }))
  }

  // Apply one carrier's date to ALL selected carriers in the same LOC
  const applyDateToAll = (loc, date) => {
    setSelections((prev) => ({
      ...prev,
      ...Object.fromEntries(
        loc.carriers
          .filter((c) => prev[`${loc.key}.${c.key}`]?.selected)
          .map((c) => [`${loc.key}.${c.key}`, { ...prev[`${loc.key}.${c.key}`], date }])
      ),
    }))
  }

  const addLoc = (loc) => {
    setAddedKeys((prev) => [...prev, loc.key])
    setAddedSels((prev) => ({ ...prev, [loc.key]: { selected: true, date: null } }))
    setShowAddPanel(false)
    setExpandedLocs((prev) => new Set([...prev, loc.key]))
  }

  const removeLoc = (key) => {
    setAddedKeys((prev) => prev.filter((k) => k !== key))
    setAddedSels((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleStart = () => {
    const config = BASE_LOCS.map((loc) => {
      const carrierData = loc.carriers.map((c) => {
        const s = selections[`${loc.key}.${c.key}`]
        return { ...c, selected: s?.selected ?? false, effectiveDate: s?.date ?? null }
      })
      const selected  = carrierData.some((c) => c.selected)
      const firstDate = carrierData.find((c) => c.selected)?.effectiveDate ?? null
      return { ...loc, selected, effectiveDate: firstDate, plan: loc.label, carriers: carrierData }
    })
    const addedConfig = ADDITIONAL_LOCS
      .filter((l) => addedKeys.includes(l.key))
      .map((loc) => {
        const s = addedSels[loc.key] ?? { selected: true, date: null }
        return { ...loc, selected: s.selected, effectiveDate: s.date, carriers: [], plan: loc.description }
      })
    onStartRenewal([...config, ...addedConfig], smallGroupMap)
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Build collapsed summary line for a LOC
  const locSummary = (loc) => {
    const selected = loc.carriers.filter((c) => selections[`${loc.key}.${c.key}`]?.selected)
    if (selected.length === 0) return null
    const dates = [...new Set(selected.map((c) => selections[`${loc.key}.${c.key}`]?.date?.format('MM/DD/YYYY')).filter(Boolean))]
    return { count: selected.length, total: loc.carriers.length, dates }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Top link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="link" icon={<BarChartOutlined />} onClick={onViewDashboard}
          style={{ color: '#1a56db', fontSize: 13, padding: 0, fontWeight: 500 }}>
          Manage Renewals
        </Button>
      </div>

      {/* Banner when adding more LOCs to an existing renewal */}
      {hasLocked && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 20, borderRadius: 8 }}
          message={`${activeRenewalLocNames.join(' & ')} renewal is already in progress`}
          description="Carriers already in renewal are locked and shown for reference. Select and configure the additional carriers you want to start renewing."
        />
      )}

      {/* Step indicator */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Start New Renewal</Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          {/* Step 1: active */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid #1a2332', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a2332' }} />
            </div>
            <Text strong style={{ fontSize: 13 }}>Select LOCs & Dates</Text>
          </div>
          <div style={{ flex: 1, height: 2, background: '#e5e7eb', margin: '-20px 8px 0', maxWidth: hasAnySG ? 120 : 160 }} />
          {/* Step 2: Census Upload (only if SG selected) */}
          {hasAnySG && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #d1d5db', background: '#f9fafb' }} />
                <Text style={{ fontSize: 13, color: '#9ca3af' }}>Census Upload</Text>
              </div>
              <div style={{ flex: 1, height: 2, background: '#e5e7eb', margin: '-20px 8px 0', maxWidth: 120 }} />
            </>
          )}
          {/* Last step: pending */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #d1d5db', background: '#f9fafb' }} />
            <Text style={{ fontSize: 13, color: '#9ca3af' }}>Confirm & Start</Text>
          </div>
        </div>
      </div>

      <Paragraph style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
        Select which carriers to renew under each Line of Coverage and set their effective dates.
        Click a LOC to expand and configure its carriers.
      </Paragraph>

      {/* LOC cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {BASE_LOCS.map((loc) => {
          const isExpanded    = expandedLocs.has(loc.key)
          const isMulti       = loc.carriers.length > 1
          const anyLoc        = locAny(loc)
          const allLoc        = locAll(loc)
          const summary       = locSummary(loc)
          const missingDates  = anyLoc && !locDates(loc)

          return (
            <div
              key={loc.key}
              style={{
                border: anyLoc ? `1.5px solid ${loc.hex}40` : '1.5px solid #e5e7eb',
                borderRadius: 12,
                background: '#fff',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* ── Card header (always visible, clickable) ── */}
              <div
                onClick={() => toggleExpand(loc.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px',
                  background: anyLoc ? loc.hex + '06' : '#fafafa',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Chevron */}
                <span style={{ color: '#9ca3af', fontSize: 11, width: 12, flexShrink: 0 }}>
                  {isExpanded ? <DownOutlined /> : <RightOutlined />}
                </span>

                {/* LOC icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: anyLoc ? loc.hex + '18' : '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: anyLoc ? loc.hex : '#9ca3af', fontSize: 16,
                  transition: 'all 0.15s', flexShrink: 0,
                }}>
                  {loc.icon}
                </div>

                {/* LOC name + summary */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontWeight: 700, fontSize: 15, color: anyLoc ? '#111827' : '#6b7280' }}>
                    {loc.label}
                  </Text>
                  {/* Collapsed summary */}
                  {!isExpanded && summary && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 12, color: loc.hex }}>
                        {summary.count} of {summary.total} carrier{summary.total > 1 ? 's' : ''} selected
                      </Text>
                      {summary.dates.length > 0 ? (
                        summary.dates.map((d) => (
                          <Tag key={d} style={{ fontSize: 11, borderRadius: 8, color: loc.hex, borderColor: loc.hex + '50', background: loc.hex + '0d', margin: 0 }}>
                            {d}
                          </Tag>
                        ))
                      ) : (
                        <Text style={{ fontSize: 12, color: '#ef4444' }}>· dates required</Text>
                      )}
                    </div>
                  )}
                  {!isExpanded && !summary && (
                    <Text style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginTop: 2 }}>
                      Click to select carriers
                    </Text>
                  )}
                </div>

                {/* Right side: LOC-level checkbox + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}>
                  {anyLoc && missingDates && (
                    <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>Dates needed</Text>
                  )}
                  {anyLoc && !missingDates && (
                    <Tag color="blue" style={{ borderRadius: 8, fontSize: 11, margin: 0 }}>In Renewal</Tag>
                  )}
                  {isMulti ? (
                    <Checkbox
                      checked={allLoc}
                      indeterminate={anyLoc && !allLoc}
                      onChange={(e) => toggleAllCarriers(loc, e.target.checked)}
                    />
                  ) : (
                    <Checkbox
                      checked={selections[`${loc.key}.${loc.carriers[0].key}`]?.selected}
                      onChange={(e) => toggleCarrier(loc.key, loc.carriers[0].key, e.target.checked)}
                    />
                  )}
                </div>
              </div>

              {/* ── Expanded carrier rows ── */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                  {/* Column headers */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 190px',
                    gap: 12, padding: '8px 18px 6px 60px',
                    background: '#f9fafb',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Carrier</Text>
                    <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Renew</Text>
                    <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Effective Date *</Text>
                  </div>

                  {loc.carriers.map((carrier, ci) => {
                    const k        = `${loc.key}.${carrier.key}`
                    const sel      = selections[k]
                    const isLast   = ci === loc.carriers.length - 1
                    const isLocked = lockedCarrierIds.has(k)
                    const otherSelected = isMulti && loc.carriers.filter((c) => c.key !== carrier.key && selections[`${loc.key}.${c.key}`]?.selected)
                    const showApplyAll  = !isLocked && isMulti && sel.selected && sel.date && otherSelected.length > 0

                    return (
                      <div key={carrier.key}>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 60px 190px',
                        gap: 12, padding: '10px 18px 10px 60px', alignItems: 'center',
                        borderBottom: '1px solid #f9fafb',
                        background: isLocked ? '#f9fafb' : sel.selected ? '#fff' : '#fafafa',
                      }}>
                        {/* Carrier name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isLocked
                            ? <LockOutlined style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }} />
                            : <div style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: sel.selected ? loc.hex : '#d1d5db',
                                transition: 'background 0.15s',
                              }} />
                          }
                          <Text style={{ fontSize: 13, fontWeight: 600, color: isLocked ? '#9ca3af' : sel.selected ? '#111827' : '#9ca3af' }}>
                            {carrier.name}
                          </Text>
                          {isLocked && (
                            <Tag style={{ fontSize: 10, borderRadius: 6, color: '#1a56db', borderColor: '#bfdbfe', background: '#eff6ff', margin: 0, padding: '0 5px' }}>
                              In Renewal
                            </Tag>
                          )}
                        </div>

                        {/* Checkbox (or empty for locked) */}
                        <div>
                          {!isLocked ? (
                            <Checkbox
                              checked={sel.selected}
                              onChange={(e) => toggleCarrier(loc.key, carrier.key, e.target.checked)}
                            />
                          ) : null}
                        </div>

                        {/* Date (locked = read-only tag; unlocked = DatePicker) */}
                        <div>
                          {isLocked ? (
                            <Tag icon={<LockOutlined />} style={{ fontSize: 11, borderRadius: 6, color: '#6b7280', borderColor: '#e5e7eb' }}>
                              {sel.date?.format('MM/DD/YYYY') ?? '—'}
                            </Tag>
                          ) : (
                            <>
                              <DatePicker
                                style={{ width: '100%' }}
                                placeholder="MM/DD/YYYY"
                                value={sel.date}
                                disabled={!sel.selected}
                                onChange={(date) => setCarrierDate(loc.key, carrier.key, date)}
                                disabledDate={(d) => d && d.isBefore(DISABLED_BEFORE)}
                                format="MM/DD/YYYY"
                              />
                              {showApplyAll && (
                                <button
                                  onClick={() => applyDateToAll(loc, sel.date)}
                                  style={{
                                    marginTop: 4, background: 'none', border: 'none',
                                    cursor: 'pointer', padding: 0,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    color: loc.hex, fontSize: 11, fontWeight: 600,
                                  }}
                                >
                                  <CopyOutlined style={{ fontSize: 10 }} />
                                  Apply to all carriers
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Small Group row — per Medical carrier, only when selected and not locked */}
                      {loc.key === 'MEDICAL' && sel.selected && !isLocked && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                          margin: '0 18px 10px 60px', padding: '8px 14px',
                          background: '#eef4ff', border: '1px solid #c7d9fb', borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 12, color: '#1e3a6e' }}>
                            Will the <Text strong style={{ color: '#1e3a6e' }}>{carrier.name}</Text> renewal contain Small Group offers?
                          </Text>
                          <Radio.Group
                            value={smallGroupMap[k] ?? 'no'}
                            onChange={(e) => setSmallGroupMap((prev) => ({ ...prev, [k]: e.target.value }))}
                            style={{ display: 'flex', gap: 16, flexShrink: 0 }}
                          >
                            <Radio value="no">No</Radio>
                            <Radio value="yes">Yes</Radio>
                          </Radio.Group>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Added LOC cards */}
        {addedKeys.length > 0 && (
          <>
            <div style={{ padding: '6px 4px 2px' }}>
              <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Added to this renewal
              </Text>
            </div>
            {addedKeys.map((key) => {
              const loc      = ADDITIONAL_LOCS.find((l) => l.key === key)
              const sel      = addedSels[key] ?? { selected: true, date: null }
              const isExpanded = expandedLocs.has(key)

              return (
                <div key={loc.key} style={{
                  border: sel.selected ? `1.5px solid ${loc.hex}40` : '1.5px solid #e5e7eb',
                  borderRadius: 12, background: '#fff', overflow: 'hidden',
                }}>
                  <div
                    onClick={() => toggleExpand(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 18px',
                      background: sel.selected ? loc.hex + '06' : '#fafafa',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    <span style={{ color: '#9ca3af', fontSize: 11, width: 12, flexShrink: 0 }}>
                      {isExpanded ? <DownOutlined /> : <RightOutlined />}
                    </span>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: sel.selected ? loc.hex + '18' : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: sel.selected ? loc.hex : '#9ca3af', fontSize: 16, flexShrink: 0,
                    }}>
                      {loc.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{loc.label}</Text>
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: loc.hex,
                          background: loc.hex + '15', borderRadius: 4, padding: '1px 6px',
                        }}>NEW</span>
                      </div>
                      <Text style={{ fontSize: 12, color: '#9ca3af' }}>{loc.description}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
                      onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => removeLoc(loc.key)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#9ca3af', fontSize: 13, padding: 4, borderRadius: 4,
                          display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                      >
                        <CloseOutlined />
                      </button>
                      <Checkbox
                        checked={sel.selected}
                        onChange={(e) =>
                          setAddedSels((prev) => ({
                            ...prev,
                            [key]: { selected: e.target.checked, date: e.target.checked ? prev[key].date : null },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px 14px 60px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>Effective Date *</Text>
                        <DatePicker
                          style={{ width: 190 }}
                          placeholder="MM/DD/YYYY"
                          value={sel.date}
                          disabled={!sel.selected}
                          onChange={(date) => setAddedSels((prev) => ({ ...prev, [key]: { ...prev[key], date } }))}
                          disabledDate={(d) => d && d.isBefore(DISABLED_BEFORE)}
                          format="MM/DD/YYYY"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Add LOC button */}
        {availableToAdd.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAddPanel((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1.5px dashed #d1d5db',
                borderRadius: 12, padding: '12px 18px', cursor: 'pointer',
                color: '#1a56db', fontSize: 13, fontWeight: 600,
                width: '100%', justifyContent: 'center', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a56db'; e.currentTarget.style.background = '#f0f5ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = 'none' }}
            >
              <PlusOutlined style={{ fontSize: 12 }} /> Add LOC
            </button>

            {showAddPanel && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 16px 6px', borderBottom: '1px solid #f3f4f6' }}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    No current plans — select to add
                  </Text>
                </div>
                {availableToAdd.map((loc) => (
                  <div key={loc.key} onClick={() => addLoc(loc)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8faff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: loc.hex + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: loc.hex, fontSize: 14, flexShrink: 0,
                    }}>
                      {loc.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{loc.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{loc.description}</div>
                    </div>
                    <PlusOutlined style={{ color: '#9ca3af', fontSize: 12 }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation alerts */}
      {!anySelected && (
        <Alert style={{ marginBottom: 16, borderRadius: 8 }} type="warning" showIcon
          message="Please select at least one carrier to proceed." />
      )}
      {anySelected && !allSelectedHaveDates && (
        <Alert style={{ marginBottom: 16, borderRadius: 8 }} type="warning" showIcon
          message="Please set an effective date for all selected carriers." />
      )}
      {anySelected && skippedBase.length > 0 && allSelectedHaveDates && (
        <Alert style={{ marginBottom: 16, borderRadius: 8 }} type="info" showIcon
          message={`${skippedBase.map((l) => l.label).join(' & ')} ${skippedBase.length === 1 ? 'is' : 'are'} not included in this renewal`}
          description={`Current plans remain active and will be copied to the new plan year when the renewal is finalized.`}
        />
      )}

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <Button type="primary" size="large" disabled={!canProceed} onClick={handleStart}
          style={{
            width: '100%', height: 48, fontSize: 15, fontWeight: 600,
            background: canProceed ? '#1a2332' : undefined,
            borderColor: canProceed ? '#1a2332' : undefined,
            borderRadius: 8,
          }}
        >
          Next
        </Button>
        {onCancel && (
          <Button type="link" onClick={onCancel} style={{ color: '#6b7280', fontWeight: 500 }}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
