import { useState } from 'react'
import {
  Typography,
  Checkbox,
  DatePicker,
  Button,
  Alert,
  Radio,
} from 'antd'
import {
  MedicineBoxOutlined,
  SmileOutlined,
  EyeOutlined,
  BarChartOutlined,
  PlusOutlined,
  CloseOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

// LOCs that already have active plans — with their current carriers
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
    carriers: [
      { key: 'DELTA', name: 'Delta Dental' },
    ],
  },
  {
    key: 'VISION',
    label: 'Vision',
    hex: '#7e3af2',
    icon: <EyeOutlined />,
    carriers: [
      { key: 'VSP', name: 'VSP' },
    ],
  },
]

// LOCs with no current plans — available to add
const ADDITIONAL_LOCS = [
  {
    key: 'WORKSITE',
    label: 'Worksite',
    hex: '#d97706',
    icon: <ShopOutlined />,
    description: 'Accident, Critical Illness, Hospital Indemnity',
  },
  {
    key: 'LIFE_DISABILITY',
    label: 'Life & Disability',
    hex: '#dc2626',
    icon: <SafetyCertificateOutlined />,
    description: 'Basic Life, Voluntary Life, AD&D, STD, LTD',
  },
]

const DISABLED_BEFORE = dayjs('2026-01-01')

// Initial state: one entry per carrier — 'LOC_KEY.CARRIER_KEY' -> { selected, date }
function buildInitialSelections() {
  return Object.fromEntries(
    BASE_LOCS.flatMap((loc) =>
      loc.carriers.map((c) => [`${loc.key}.${c.key}`, { selected: false, date: null }])
    )
  )
}

export default function LOCSelectionPage({ onStartRenewal, onViewDashboard }) {
  const [selections, setSelections]       = useState(buildInitialSelections())
  const [addedKeys, setAddedKeys]         = useState([])
  const [addedSels, setAddedSels]         = useState({}) // LOC key -> { selected, date }
  const [showAddPanel, setShowAddPanel]   = useState(false)
  const [smallGroup, setSmallGroup]       = useState('no')

  // ── Derived state ──────────────────────────────────────────────────────────

  // Is any carrier selected for this LOC?
  const locAny = (loc) => loc.carriers.some((c) => selections[`${loc.key}.${c.key}`]?.selected)
  // Are all carriers selected?
  const locAll = (loc) => loc.carriers.every((c) => selections[`${loc.key}.${c.key}`]?.selected)
  // Do all selected carriers have dates?
  const locDates = (loc) =>
    loc.carriers.every((c) => {
      const s = selections[`${loc.key}.${c.key}`]
      return !s?.selected || s?.date !== null
    })

  const anyBaseSelected    = BASE_LOCS.some(locAny)
  const anyMedSelected     = locAny(BASE_LOCS.find((l) => l.key === 'MEDICAL'))
  const anyAdded           = Object.values(addedSels).some((s) => s.selected)
  const anySelected        = anyBaseSelected || anyAdded

  const allSelectedHaveDates =
    BASE_LOCS.every(locDates) &&
    Object.values(addedSels).every((s) => !s.selected || s.date !== null)

  const canProceed  = anySelected && allSelectedHaveDates
  const skippedBase = BASE_LOCS.filter((loc) => !locAny(loc))

  const availableToAdd = ADDITIONAL_LOCS.filter((l) => !addedKeys.includes(l.key))

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleCarrier = (locKey, carrierKey, checked) => {
    const k = `${locKey}.${carrierKey}`
    setSelections((prev) => ({
      ...prev,
      [k]: { selected: checked, date: checked ? prev[k].date : null },
    }))
  }

  const toggleAllCarriers = (loc, checked) =>
    setSelections((prev) => ({
      ...prev,
      ...Object.fromEntries(
        loc.carriers.map((c) => {
          const k = `${loc.key}.${c.key}`
          return [k, { selected: checked, date: checked ? prev[k].date : null }]
        })
      ),
    }))

  const setCarrierDate = (locKey, carrierKey, date) => {
    const k = `${locKey}.${carrierKey}`
    setSelections((prev) => ({ ...prev, [k]: { ...prev[k], date } }))
  }

  const addLoc = (loc) => {
    setAddedKeys((prev) => [...prev, loc.key])
    setAddedSels((prev) => ({ ...prev, [loc.key]: { selected: true, date: null } }))
    setShowAddPanel(false)
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
      const selected = carrierData.some((c) => c.selected)
      const firstDate = carrierData.find((c) => c.selected)?.effectiveDate ?? null
      return {
        ...loc,
        selected,
        effectiveDate: firstDate,
        plan: loc.carriers.map((c) => `${c.plan} — ${c.name}`).join(', '),
        carriers: carrierData,
      }
    })

    const addedConfig = ADDITIONAL_LOCS
      .filter((l) => addedKeys.includes(l.key))
      .map((loc) => {
        const s = addedSels[loc.key] ?? { selected: true, date: null }
        return { ...loc, selected: s.selected, effectiveDate: s.date, carriers: [], plan: loc.description }
      })

    onStartRenewal([...config, ...addedConfig])
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>

      {/* Top link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button
          type="link" icon={<BarChartOutlined />} onClick={onViewDashboard}
          style={{ color: '#1a56db', fontSize: 13, padding: 0, fontWeight: 500 }}
        >
          Manage Renewal Cycles
        </Button>
      </div>

      {/* Step indicator */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Start New Renewal</Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '3px solid #1a2332', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a2332' }} />
            </div>
            <Text strong style={{ fontSize: 13 }}>Select LOCs & Dates</Text>
          </div>
          <div style={{ flex: 1, height: 2, background: '#e5e7eb', margin: '-20px 8px 0', maxWidth: 160 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #d1d5db', background: '#f9fafb' }} />
            <Text style={{ fontSize: 13, color: '#9ca3af' }}>Confirm & Start</Text>
          </div>
        </div>
      </div>

      {/* Description */}
      <Paragraph style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
        Select which carriers to renew under each Line of Coverage and set their effective dates.
        You can also add new LOCs that aren't part of your current plan year.
      </Paragraph>

      {/* LOC table */}
      <div style={{ marginBottom: 28 }}>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 180px',
          gap: 12, padding: '0 4px 10px',
          borderBottom: '1px solid #e5e7eb', marginBottom: 0,
        }}>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Line of Coverage / Carrier
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Renew
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Effective Date *
          </Text>
        </div>

        {/* Base LOC sections */}
        {BASE_LOCS.map((loc, locIdx) => {
          const isMulti    = loc.carriers.length > 1
          const anyLoc     = locAny(loc)
          const allLoc     = locAll(loc)
          const isLastBase = locIdx === BASE_LOCS.length - 1 && addedKeys.length === 0
          const selectedCount = loc.carriers.filter((c) => selections[`${loc.key}.${c.key}`]?.selected).length

          return (
            <div
              key={loc.key}
              style={{ borderBottom: isLastBase ? 'none' : '1px solid #f0f1f3' }}
            >
              {/* ── LOC header ── */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 180px',
                gap: 12, padding: '14px 4px 10px',
                background: anyLoc ? loc.hex + '08' : 'transparent',
              }}>
                {/* LOC name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: anyLoc ? loc.hex + '18' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: anyLoc ? loc.hex : '#9ca3af',
                    fontSize: 14, transition: 'all 0.15s',
                  }}>
                    {loc.icon}
                  </div>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 14, color: anyLoc ? '#111827' : '#6b7280' }}>
                      {loc.label}
                    </Text>
                    {isMulti && (
                      <div style={{ fontSize: 11, color: anyLoc ? loc.hex : '#9ca3af', marginTop: 1 }}>
                        {selectedCount} of {loc.carriers.length} carriers selected
                      </div>
                    )}
                  </div>
                </div>

                {/* LOC-level checkbox */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {isMulti ? (
                    <Checkbox
                      checked={allLoc}
                      indeterminate={anyLoc && !allLoc}
                      onChange={(e) => toggleAllCarriers(loc, e.target.checked)}
                    >
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>All</Text>
                    </Checkbox>
                  ) : (
                    // Single-carrier: LOC checkbox controls the only carrier
                    <Checkbox
                      checked={selections[`${loc.key}.${loc.carriers[0].key}`]?.selected}
                      onChange={(e) => toggleCarrier(loc.key, loc.carriers[0].key, e.target.checked)}
                    />
                  )}
                </div>

                {/* No date at LOC level — dates live on carrier rows */}
                <div />
              </div>

              {/* ── Carrier rows ── */}
              <div style={{ paddingLeft: 42, paddingBottom: 8 }}>
                {loc.carriers.map((carrier) => {
                  const k   = `${loc.key}.${carrier.key}`
                  const sel = selections[k]
                  return (
                    <div
                      key={carrier.key}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 180px',
                        gap: 12, padding: '8px 4px',
                        borderTop: '1px solid #f3f4f6',
                        alignItems: 'center',
                      }}
                    >
                      {/* Carrier name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          background: sel.selected ? loc.hex : '#d1d5db',
                          transition: 'background 0.15s',
                        }} />
                        <Text style={{ fontSize: 13, fontWeight: 600, color: sel.selected ? '#111827' : '#9ca3af' }}>
                          {carrier.name}
                        </Text>
                      </div>

                      {/* Per-carrier checkbox (only for multi-carrier LOCs; single-carrier handled at LOC level) */}
                      <div>
                        {isMulti && (
                          <Checkbox
                            checked={sel.selected}
                            onChange={(e) => toggleCarrier(loc.key, carrier.key, e.target.checked)}
                          />
                        )}
                      </div>

                      {/* Per-carrier date */}
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="MM/DD/YYYY"
                        value={sel.date}
                        disabled={!sel.selected}
                        onChange={(date) => setCarrierDate(loc.key, carrier.key, date)}
                        disabledDate={(d) => d && d.isBefore(DISABLED_BEFORE)}
                        format="MM/DD/YYYY"
                      />
                    </div>
                  )
                })}
              </div>

              {/* Small Group sub-row — Medical only, shown when any medical carrier selected */}
              {loc.key === 'MEDICAL' && anyMedSelected && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  margin: '0 4px 12px 46px', padding: '10px 14px',
                  background: '#eef4ff', border: '1px solid #c7d9fb', borderRadius: 8,
                }}>
                  <Text style={{ fontSize: 13, color: '#1e3a6e' }}>
                    Will this renewal contain Small Group offers?
                  </Text>
                  <Radio.Group
                    value={smallGroup}
                    onChange={(e) => setSmallGroup(e.target.value)}
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

        {/* Added LOC rows (no carriers — single checkbox + date) */}
        {addedKeys.length > 0 && (
          <>
            <div style={{
              padding: '10px 4px 6px',
              borderTop: '1px dashed #e5e7eb', marginTop: 4,
            }}>
              <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Added to this renewal
              </Text>
            </div>
            {addedKeys.map((key, i) => {
              const loc = ADDITIONAL_LOCS.find((l) => l.key === key)
              const sel = addedSels[key] ?? { selected: true, date: null }
              const isLast = i === addedKeys.length - 1
              return (
                <div key={loc.key} style={{
                  borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
                  background: sel.selected ? '#f8faff' : 'transparent',
                }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 180px 28px',
                    gap: 12, padding: '14px 4px',
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: sel.selected ? loc.hex + '15' : '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: sel.selected ? loc.hex : '#9ca3af', fontSize: 14,
                      }}>
                        {loc.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {loc.label}
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: loc.hex,
                            background: loc.hex + '15', borderRadius: 4,
                            padding: '1px 6px', letterSpacing: '0.04em',
                          }}>NEW</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{loc.description}</div>
                      </div>
                    </div>

                    <Checkbox
                      checked={sel.selected}
                      onChange={(e) =>
                        setAddedSels((prev) => ({
                          ...prev,
                          [key]: { selected: e.target.checked, date: e.target.checked ? prev[key].date : null },
                        }))
                      }
                    />

                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="MM/DD/YYYY"
                      value={sel.date}
                      disabled={!sel.selected}
                      onChange={(date) => setAddedSels((prev) => ({ ...prev, [key]: { ...prev[key], date } }))}
                      disabledDate={(d) => d && d.isBefore(DISABLED_BEFORE)}
                      format="MM/DD/YYYY"
                    />

                    <button
                      onClick={() => removeLoc(loc.key)}
                      title={`Remove ${loc.label}`}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', fontSize: 14, padding: 4, borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Add LOC button + panel */}
        {availableToAdd.length > 0 && (
          <div style={{ marginTop: 12, position: 'relative' }}>
            <button
              onClick={() => setShowAddPanel((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1px dashed #d1d5db',
                borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
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
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid #f3f4f6' }}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    No current plans — select to add to this renewal
                  </Text>
                </div>
                {availableToAdd.map((loc) => (
                  <div
                    key={loc.key} onClick={() => addLoc(loc)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: '1px solid #f9fafb', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8faff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: loc.hex + '15',
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
        <Alert
          style={{ marginBottom: 16, borderRadius: 8 }}
          type="warning" showIcon
          message="Please select at least one carrier to proceed."
        />
      )}
      {anySelected && !allSelectedHaveDates && (
        <Alert
          style={{ marginBottom: 16, borderRadius: 8 }}
          type="warning" showIcon
          message="Please set an effective date for all selected carriers."
        />
      )}
      {anySelected && skippedBase.length > 0 && allSelectedHaveDates && (
        <Alert
          style={{ marginBottom: 16, borderRadius: 8 }}
          type="info" showIcon
          message={`${skippedBase.map((l) => l.label).join(' & ')} ${skippedBase.length === 1 ? 'is' : 'are'} not included in this renewal`}
          description={`${skippedBase.length === 1 ? 'It' : 'They'} will not be part of this renewal. Current plans will remain active and can be renewed in a future cycle.`}
        />
      )}

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <Button
          type="primary" size="large"
          disabled={!canProceed}
          onClick={handleStart}
          style={{
            width: '100%', height: 48, fontSize: 15, fontWeight: 600,
            background: canProceed ? '#1a2332' : undefined,
            borderColor: canProceed ? '#1a2332' : undefined,
            borderRadius: 8,
          }}
        >
          Next
        </Button>
        <Button type="link" style={{ color: '#1a56db', fontWeight: 500 }}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
