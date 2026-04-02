import { useState } from 'react'
import { Typography, Button, Tag, Alert, Select } from 'antd'
import {
  CheckCircleFilled,
  ArrowLeftOutlined,
  CalendarOutlined,
  SyncOutlined,
  MedicineBoxOutlined,
  SmileOutlined,
  EyeOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

// Every LOC that exists in the system — always shown on this screen
const ALL_LOCS = [
  { key: 'MEDICAL',         label: 'Medical',          hex: '#1a56db', icon: <MedicineBoxOutlined />, isMDV: true  },
  { key: 'DENTAL',          label: 'Dental',           hex: '#0e9f6e', icon: <SmileOutlined />,       isMDV: true  },
  { key: 'VISION',          label: 'Vision',           hex: '#7e3af2', icon: <EyeOutlined />,         isMDV: true  },
  { key: 'LIFE_DISABILITY', label: 'Life & Disability',hex: '#dc2626', icon: <SafetyCertificateOutlined />, isMDV: false },
  { key: 'WORKSITE',        label: 'Worksite',         hex: '#d97706', icon: <ShopOutlined />,        isMDV: false },
]

// Current effective date per LOC (current plan year — hardcoded for prototype)
const CURRENT_EFF_DATE = {
  MEDICAL:          '01/01/2026',
  DENTAL:           '01/01/2026',
  VISION:           '01/01/2026',
  LIFE_DISABILITY:  '01/01/2026',
  WORKSITE:         '01/01/2026',
}

// Mock current plans for LOCs/carriers that have plan data in the system
const CARRIER_PLANS = {
  'MEDICAL.ANTHEM': [
    { name: 'Anthem PPO Gold 2000',   type: 'FULLY-INSURED', enrollments: 45  },
    { name: 'Anthem PPO Silver 3500', type: 'FULLY-INSURED', enrollments: 28  },
  ],
  'MEDICAL.AETNA': [
    { name: 'Aetna Choice POS II',    type: 'FULLY-INSURED', enrollments: 33  },
  ],
  'DENTAL.DELTA': [
    { name: 'Delta Dental PPO Enhanced', type: 'FULLY-INSURED', enrollments: 200 },
  ],
  'VISION.VSP': [
    { name: 'VSP Vision Plan Basic',  type: 'FULLY-INSURED', enrollments: 180 },
  ],
  // Life & Disability has plans in system (not carrier-split for this LOC)
  'LIFE_DISABILITY': [
    { name: 'Basic Life / AD&D',      type: 'FULLY-INSURED', enrollments: null },
    { name: 'Long Term Disability',   type: 'FULLY-INSURED', enrollments: null },
  ],
  // WORKSITE: no plans in system
}

const PREMIUM_OPTIONS = [
  { value: 'standard',  label: 'Standard (EE, ES, EC, EF)' },
  { value: '3tier',     label: '3-Tier (EE, ES, EF)'       },
  { value: 'composite', label: 'Composite'                  },
]

export default function ConfirmationPage({ config, onBack, onStartRenewal }) {
  const [premiumTypes, setPremiumTypes] = useState({})

  // LOCs being started in this renewal run (for button label)
  const startingLocs = (config || []).filter((l) => l.selected).map((l) => l.label)

  // Look up whether a LOC was included in the renewal config
  const configLoc = (key) => config?.find((l) => l.key === key)

  // Plans to show for a given LOC (based on which carriers were selected)
  const getPlans = (locKey) => {
    const loc = configLoc(locKey)
    if (!loc) return CARRIER_PLANS[locKey] || []      // not in renewal: use LOC-level plans

    if (loc.carriers?.length > 0) {
      return loc.carriers
        .filter((c) => c.selected)
        .flatMap((c) => CARRIER_PLANS[`${locKey}.${c.key}`] || [])
    }
    return CARRIER_PLANS[locKey] || []
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Step indicator */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Start New Renewal</Title>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#1a2332',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleFilled style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text style={{ fontSize: 13, color: '#9ca3af' }}>General Info</Text>
          </div>
          <div style={{ flex: 1, height: 2, background: '#1a2332', margin: '-20px 8px 0', maxWidth: 160 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '3px solid #1a2332', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a2332' }} />
            </div>
            <Text strong style={{ fontSize: 13 }}>Current Plan Info</Text>
          </div>
        </div>
      </div>

      {/* Section header */}
      <Title level={4} style={{ marginBottom: 8 }}>Current Plans</Title>
      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7, display: 'block', marginBottom: 20 }}>
        To start the new renewal, we require current plan information for comparisons between offers.
        LOCs not included in this renewal will have their existing plans copied as-is to the new plan year when the renewal is finalized.
      </Text>

      <Alert
        type="warning" showIcon style={{ marginBottom: 28, borderRadius: 8 }}
        message="Plans marked as age-banded will not appear here. To include age-banded plans, go back and select Yes, this is a small group renewal."
      />

      {/* Per-LOC sections */}
      {ALL_LOCS.map((loc) => {
        const cfgLoc    = configLoc(loc.key)
        const inRenewal = cfgLoc?.selected === true
        const plans     = getPlans(loc.key)
        const hasPlans  = plans.length > 0
        const effDate   = CURRENT_EFF_DATE[loc.key]

        return (
          <div key={loc.key} style={{ marginBottom: 32 }}>

            {/* LOC header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, color: loc.hex }}>{loc.icon}</span>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{loc.label}</Text>

              {/* Show current effective date only for not-in-renewal LOCs */}
              {!inRenewal && effDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                  <CalendarOutlined style={{ fontSize: 12 }} />
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>{effDate}</Text>
                </div>
              )}

              {inRenewal
                ? <Tag color="blue" style={{ borderRadius: 10, fontSize: 11, marginLeft: 2 }}>In Renewal</Tag>
                : <Tag icon={<SyncOutlined />} style={{ borderRadius: 10, fontSize: 11, color: '#6b7280', borderColor: '#d1d5db', marginLeft: 2 }}>
                    Not Renewing
                  </Tag>
              }
            </div>

            {/* Body */}
            {inRenewal ? (
              /* ── In Renewal ─────────────────────────────────── */
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                {/* Column headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: hasPlans ? '1fr 140px 120px' : '1fr',
                  padding: '8px 20px', background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Current Plans
                  </Text>
                  {hasPlans && (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Enrollments
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Rates
                      </Text>
                    </>
                  )}
                </div>

                {hasPlans ? (
                  plans.map((plan, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px 120px',
                      padding: '14px 20px', alignItems: 'center',
                      borderBottom: i < plans.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{plan.name}</Text>
                        <Tag style={{
                          fontSize: 10, borderRadius: 4, fontWeight: 600,
                          color: '#1a56db', background: '#eff6ff', borderColor: '#bfdbfe',
                          padding: '0 6px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {plan.type}
                        </Tag>
                      </div>
                      <Text style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                        {plan.enrollments ?? '—'}
                      </Text>
                      <Button type="link" style={{ padding: 0, fontSize: 13, fontWeight: 600, color: '#1a56db' }}>
                        Rate Details
                      </Button>
                    </div>
                  ))
                ) : (
                  /* NCP: in renewal but no plans in system */
                  <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                    {loc.isMDV ? (
                      <div>
                        <Text style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, display: 'block', marginBottom: 14 }}>
                          You have no current plans for this benefit. Choose a premium type before adding
                          enrollment information when adding a new offer.
                        </Text>
                        <Select
                          placeholder="Select premium type"
                          value={premiumTypes[loc.key]}
                          onChange={(val) => setPremiumTypes((p) => ({ ...p, [loc.key]: val }))}
                          style={{ width: 240 }}
                          options={PREMIUM_OPTIONS}
                        />
                      </div>
                    ) : (
                      <Text style={{ fontSize: 14, color: '#9ca3af' }}>
                        No current plans — enrollment and rate details will be entered when adding offers.
                      </Text>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* ── Not in Renewal — carry over ─────────────────── */
              <div style={{
                border: '1px solid #f0f0f0', borderRadius: 8,
                padding: '16px 20px',
                background: '#fafafa',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <SyncOutlined style={{ color: '#9ca3af', fontSize: 14, flexShrink: 0 }} />
                <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Not included in this renewal. Existing plans will be copied as-is to the new plan year when the renewal is finalized.
                </Text>
              </div>
            )}
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <Button
          type="primary" size="large" onClick={onStartRenewal}
          style={{
            width: '100%', height: 48, fontSize: 15, fontWeight: 600,
            background: '#1a2332', borderColor: '#1a2332', borderRadius: 8,
          }}
        >
          Confirm Current Plans and Start {startingLocs.join(' & ')} Renewal
        </Button>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack}
          style={{ color: '#1a56db', fontWeight: 500 }}>
          Back
        </Button>
      </div>
    </div>
  )
}
