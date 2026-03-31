import { Typography, Button, Tag, Divider, Tooltip } from 'antd'
import {
  MedicineBoxOutlined, SmileOutlined, EyeOutlined,
  ShopOutlined, SafetyCertificateOutlined,
  CalendarOutlined, CheckCircleFilled, SyncOutlined, PlusOutlined,
  FileTextOutlined, AuditOutlined, ReloadOutlined, ArrowRightOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const LOC_META = {
  MEDICAL:          { icon: <MedicineBoxOutlined />,       hex: '#1a56db', bg: '#eff6ff', label: 'Medical'          },
  DENTAL:           { icon: <SmileOutlined />,             hex: '#0e9f6e', bg: '#f0fdf4', label: 'Dental'           },
  VISION:           { icon: <EyeOutlined />,               hex: '#7e3af2', bg: '#faf5ff', label: 'Vision'           },
  WORKSITE:         { icon: <ShopOutlined />,              hex: '#d97706', bg: '#fffbeb', label: 'Worksite'         },
  LIFE_DISABILITY:  { icon: <SafetyCertificateOutlined />, hex: '#dc2626', bg: '#fff1f2', label: 'Life & Disability' },
}

// All known LOCs with their carriers (base system data)
const ALL_LOCS = [
  {
    key: 'MEDICAL',
    carriers: [
      { key: 'ANTHEM', name: 'Anthem Blue Cross' },
      { key: 'AETNA',  name: 'Aetna' },
    ],
  },
  {
    key: 'DENTAL',
    carriers: [{ key: 'DELTA', name: 'Delta Dental' }],
  },
  {
    key: 'VISION',
    carriers: [{ key: 'VSP', name: 'VSP' }],
  },
  {
    key: 'LIFE_DISABILITY',
    carriers: [{ key: 'SUN', name: 'Sun Life' }],
  },
  {
    key: 'WORKSITE',
    carriers: [{ key: 'AFLAC', name: 'Aflac' }],
  },
]

// Previous cycle data per carrier
const PREV_CYCLE = {
  'MEDICAL.ANTHEM':         { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
  'MEDICAL.AETNA':          { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
  'DENTAL.DELTA':           { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
  'VISION.VSP':             { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
  'LIFE_DISABILITY.SUN':    { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
  'WORKSITE.AFLAC':         { effectiveDate: '01/01/2026', completedDate: '12/15/2025' },
}

const RENEWAL_STAGES = [
  { key: 'offers',    label: 'Offers',    icon: <ReloadOutlined /> },
  { key: 'proposals', label: 'Proposals', icon: <FileTextOutlined /> },
  { key: 'afp',       label: 'AFP',       icon: <AuditOutlined /> },
  { key: 'complete',  label: 'Complete',  icon: <CheckCircleFilled /> },
]

function StageProgress({ currentStage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {RENEWAL_STAGES.map((stage, i) => {
        const isDone    = i < currentStage
        const isCurrent = i === currentStage
        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={stage.label}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: isDone ? '#1a2332' : isCurrent ? '#1a56db' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: isDone || isCurrent ? '#fff' : '#9ca3af',
                cursor: 'default',
              }}>
                {isDone
                  ? <CheckCircleFilled style={{ fontSize: 10 }} />
                  : <span style={{ fontWeight: 700 }}>{i + 1}</span>}
              </div>
            </Tooltip>
            {i < RENEWAL_STAGES.length - 1 && (
              <div style={{ width: 14, height: 2, background: isDone ? '#1a2332' : '#e5e7eb', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
      {/* Current stage label next to the dots */}
      <Text style={{ fontSize: 11, color: '#1a56db', fontWeight: 600, marginLeft: 8, whiteSpace: 'nowrap' }}>
        {RENEWAL_STAGES[currentStage]?.label}
      </Text>
    </div>
  )
}

export default function RenewalCyclesDashboard({ config, onStartRenewal, onViewCarrierOffers }) {
  const activeRenewal = config !== null

  // Flatten all selected carriers across all LOCs
  const allSelectedCarriers = activeRenewal
    ? config.flatMap((loc) => (loc.carriers || []).filter((c) => c.selected).map((c) => ({ ...c, locKey: loc.key })))
    : []

  const renewingLocCount = activeRenewal
    ? config.filter((l) => l.carriers?.some((c) => c.selected)).length
    : 0

  // Merge config LOCs into ALL_LOCS (for added LOCs like Worksite/Life&Disability)
  const displayLocs = ALL_LOCS.map((loc) => {
    const cfgLoc = config?.find((l) => l.key === loc.key)
    return {
      ...loc,
      carriers: loc.carriers.map((c) => {
        const cfgCarrier = cfgLoc?.carriers?.find((cc) => cc.key === c.key)
        return { ...c, selected: cfgCarrier?.selected ?? false, effectiveDate: cfgCarrier?.effectiveDate ?? null }
      }),
    }
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Apex Solutions Inc &nbsp;›&nbsp; Renewals &nbsp;›&nbsp;
          <Text strong style={{ color: '#1a2332' }}>Manage Renewals</Text>
        </Text>
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>Manage Renewals</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Track each carrier's renewal cycle independently across all Lines of Coverage.
          </Text>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />} onClick={onStartRenewal}
          style={{ background: '#1a2332', borderColor: '#1a2332', fontWeight: 600 }}
        >
          Start New Renewal
        </Button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {[
          {
            label: 'Carriers in Active Renewal',
            value: allSelectedCarriers.length,
            color: '#1a56db',
            sub: allSelectedCarriers.length > 0
              ? allSelectedCarriers.map((c) => c.name).join(', ')
              : 'None',
          },
          {
            label: 'LOCs in Active Renewal',
            value: renewingLocCount,
            color: '#0e9f6e',
            sub: activeRenewal
              ? config.filter((l) => l.carriers?.some((c) => c.selected)).map((l) => LOC_META[l.key]?.label || l.label).join(', ') || 'None'
              : '—',
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '16px 20px', borderLeft: `3px solid ${stat.color}`,
          }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{stat.label}</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 26, fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{stat.sub}</Text>
            </div>
          </div>
        ))}
      </div>

      {/* LOC cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayLocs.map((loc) => {
          const meta          = LOC_META[loc.key]
          const anySelected   = loc.carriers.some((c) => c.selected)
          const selectedCarriers = loc.carriers.filter((c) => c.selected)
          const unselectedCarriers = loc.carriers.filter((c) => !c.selected)

          return (
            <div key={loc.key} style={{
              background: '#fff',
              border: `1px solid ${anySelected ? meta.hex + '40' : '#e5e7eb'}`,
              borderLeft: `4px solid ${anySelected ? meta.hex : '#d1d5db'}`,
              borderRadius: 10, overflow: 'hidden',
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px',
                background: anySelected ? meta.bg : '#fafafa',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: anySelected ? meta.hex + '20' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: anySelected ? meta.hex : '#9ca3af', fontSize: 16,
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{meta.label}</Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {loc.carriers.length} carrier{loc.carriers.length > 1 ? 's' : ''}
                      {anySelected && ` · ${selectedCarriers.length} in renewal`}
                    </Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {anySelected ? (
                    <>
                      <Tag color="blue" style={{ borderRadius: 10, fontSize: 12, padding: '2px 10px' }}>
                        In Renewal
                      </Tag>
                      <Button
                        size="small" type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={onViewCarrierOffers}
                        style={{ background: '#1a2332', borderColor: '#1a2332', fontWeight: 600, fontSize: 12 }}
                      >
                        View Carrier Offers
                      </Button>
                    </>
                  ) : (
                    <>
                      <Tag icon={<SyncOutlined />} style={{ borderRadius: 10, fontSize: 12, padding: '2px 10px', color: '#6b7280', borderColor: '#d1d5db' }}>
                        Renewal Not Started
                      </Tag>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onStartRenewal}
                        style={{ fontWeight: 600, fontSize: 12 }}
                      >
                        Start Renewal
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 24px' }}>

                {anySelected ? (
                  <>
                    {/* Column headers */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 160px 180px 120px',
                      gap: 12, padding: '0 0 8px',
                      borderBottom: '1px solid #f3f4f6', marginBottom: 4,
                    }}>
                      {['Carrier', 'Effective Date', 'Stage', 'Status'].map((h) => (
                        <Text key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h}
                        </Text>
                      ))}
                    </div>

                    {/* Selected carrier rows */}
                    {selectedCarriers.map((carrier) => (
                      <div key={carrier.key} style={{
                        display: 'grid', gridTemplateColumns: '1fr 160px 180px 120px',
                        gap: 12, padding: '10px 0', alignItems: 'center',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.hex, flexShrink: 0 }} />
                          <Text style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{carrier.name}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CalendarOutlined style={{ color: meta.hex, fontSize: 12 }} />
                          <Text style={{ fontSize: 13, fontWeight: 600 }}>
                            {carrier.effectiveDate?.format('MM/DD/YYYY') ?? '—'}
                          </Text>
                        </div>
                        <StageProgress currentStage={0} />
                        <Tag color="blue" style={{ borderRadius: 8, fontSize: 11, width: 'fit-content' }}>In Renewal</Tag>
                      </div>
                    ))}

                    {/* Unselected carriers in same LOC (not renewing) */}
                    {unselectedCarriers.length > 0 && unselectedCarriers.map((carrier) => (
                      <div key={carrier.key} style={{
                        display: 'grid', gridTemplateColumns: '1fr 160px 180px 120px',
                        gap: 12, padding: '10px 0', alignItems: 'center',
                        borderBottom: '1px solid #f9fafb', opacity: 0.55,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
                          <Text style={{ fontSize: 13, color: '#9ca3af' }}>{carrier.name}</Text>
                        </div>
                        <Text style={{ fontSize: 13, color: '#9ca3af' }}>—</Text>
                        <div />
                        <Tag style={{ borderRadius: 8, fontSize: 11, color: '#9ca3af', borderColor: '#e5e7eb', width: 'fit-content' }}>
                          Renewal Not Started
                        </Tag>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {activeRenewal
                        ? 'No carriers in renewal for this LOC. Existing plans will be copied as-is to the new plan year when AFP is completed.'
                        : 'No active renewal. Use the Start Renewal button above to begin.'}
                    </Text>
                  </div>
                )}

                {/* Previous cycle */}
                <Divider style={{ margin: '16px 0 12px' }} />
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Previous Cycle
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {loc.carriers.map((carrier) => {
                    const prev = PREV_CYCLE[`${loc.key}.${carrier.key}`]
                    if (!prev) return null
                    return (
                      <div key={carrier.key} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '8px 14px', background: '#f9fafb', borderRadius: 6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', flexShrink: 0 }} />
                          <Text style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{carrier.name}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarOutlined style={{ color: '#9ca3af', fontSize: 11 }} />
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>Eff. {prev.effectiveDate}</Text>
                        </div>
                        <Text style={{ fontSize: 12, color: '#9ca3af' }}>AFP completed {prev.completedDate}</Text>
                        <Tag icon={<CheckCircleFilled />} color="success" style={{ borderRadius: 8, fontSize: 11, marginLeft: 'auto' }}>
                          Complete
                        </Tag>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
