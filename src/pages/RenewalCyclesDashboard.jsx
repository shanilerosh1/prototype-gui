import { Typography, Button, Tag, Divider, Steps, Tooltip } from 'antd'
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  SmileOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  SyncOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
  AuditOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const LOC_META = {
  MEDICAL: { icon: <MedicineBoxOutlined />, hex: '#1a56db', bg: '#eff6ff', label: 'Medical' },
  DENTAL:  { icon: <SmileOutlined />,        hex: '#0e9f6e', bg: '#f0fdf4', label: 'Dental'  },
  VISION:  { icon: <EyeOutlined />,          hex: '#7e3af2', bg: '#faf5ff', label: 'Vision'  },
}

// Hardcoded previous cycle (completed) — same for all LOCs
const PREV_CYCLE = {
  effectiveDate: '01/01/2026',
  endDate: '12/31/2026',
  completedDate: '12/15/2025',
}

const RENEWAL_STAGES = [
  { key: 'offers',    label: 'Offers',    icon: <ReloadOutlined /> },
  { key: 'proposals', label: 'Proposals', icon: <FileTextOutlined /> },
  { key: 'afp',       label: 'AFP',       icon: <AuditOutlined /> },
  { key: 'complete',  label: 'Complete',  icon: <CheckCircleFilled /> },
]

function StageProgress({ currentStage }) {
  // currentStage: 0=offers, 1=proposals, 2=afp, 3=complete
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {RENEWAL_STAGES.map((stage, i) => {
        const isDone    = i < currentStage
        const isCurrent = i === currentStage
        const isPending = i > currentStage
        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: isDone ? '#1a2332' : isCurrent ? '#1a56db' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
                color: isDone || isCurrent ? '#fff' : '#9ca3af',
              }}>
                {isDone
                  ? <CheckCircleFilled style={{ fontSize: 12 }} />
                  : <span style={{ fontWeight: 700 }}>{i + 1}</span>
                }
              </div>
              <Text style={{
                fontSize: 10, whiteSpace: 'nowrap',
                color: isCurrent ? '#1a56db' : isDone ? '#1a2332' : '#9ca3af',
                fontWeight: isCurrent ? 700 : 400,
              }}>
                {stage.label}
              </Text>
            </div>
            {i < RENEWAL_STAGES.length - 1 && (
              <div style={{
                width: 32, height: 2,
                background: isDone ? '#1a2332' : '#e5e7eb',
                marginBottom: 16, flexShrink: 0,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RenewalCyclesDashboard({ config, onBack, onStartRenewal }) {
  // config is null if no renewal started yet, otherwise has LOC selections
  const activeRenewal = config !== null

  const allLocs = [
    { key: 'MEDICAL' },
    { key: 'DENTAL'  },
    { key: 'VISION'  },
  ]

  const getLocConfig = (key) => config?.find((l) => l.key === key)

  const renewingLocs = activeRenewal
    ? config.filter((l) => l.selected)
    : []
  const skippedLocs = activeRenewal
    ? config.filter((l) => !l.selected)
    : []

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Apex Solutions Inc &nbsp;›&nbsp; Renewals &nbsp;›&nbsp;{' '}
          <Text strong style={{ color: '#1a2332' }}>Renewal Cycles</Text>
        </Text>
      </div>

      {/* Page header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 28,
      }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>Renewal Cycles</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Track each Line of Coverage's renewal cycle independently.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onStartRenewal}
          style={{ background: '#1a2332', borderColor: '#1a2332', fontWeight: 600 }}
        >
          Start New Renewal
        </Button>
      </div>

      {/* Summary stat row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32,
      }}>
        {[
          {
            label: 'LOCs In Active Renewal',
            value: renewingLocs.length,
            color: '#1a56db',
            sub: renewingLocs.length > 0
              ? renewingLocs.map((l) => LOC_META[l.key].label).join(', ')
              : 'None',
          },
          {
            label: 'Not Renewing This Cycle',
            value: skippedLocs.length,
            color: '#6b7280',
            sub: skippedLocs.length > 0
              ? skippedLocs.map((l) => LOC_META[l.key].label).join(', ')
              : activeRenewal ? 'None' : '—',
          },
          {
            label: 'Current Renewal Stage',
            value: activeRenewal ? 'Offers' : '—',
            color: '#f59e0b',
            sub: activeRenewal ? 'Collecting carrier offers' : 'No active renewal',
            small: true,
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '16px 20px', borderLeft: `3px solid ${stat.color}`,
          }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {stat.label}
            </Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <Text style={{
                fontSize: stat.small ? 16 : 28, fontWeight: 700,
                color: stat.color, lineHeight: 1,
              }}>
                {stat.value}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{stat.sub}</Text>
            </div>
          </div>
        ))}
      </div>

      {/* LOC cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allLocs.map((loc) => {
          const meta      = LOC_META[loc.key]
          const cfg       = getLocConfig(loc.key)
          const inRenewal = activeRenewal && cfg?.selected

          return (
            <div key={loc.key} style={{
              background: '#fff',
              border: `1px solid ${inRenewal ? meta.hex + '40' : '#e5e7eb'}`,
              borderLeft: `4px solid ${inRenewal ? meta.hex : '#d1d5db'}`,
              borderRadius: 10, overflow: 'hidden',
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px',
                background: inRenewal ? meta.bg : '#fafafa',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: inRenewal ? meta.hex + '20' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: inRenewal ? meta.hex : '#9ca3af', fontSize: 16,
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                      {meta.label}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {loc.key === 'MEDICAL' && 'BSC PPO Gold 2026 — Blue Shield of California'}
                      {loc.key === 'DENTAL'  && 'Delta Dental PPO 2026 — Delta Dental'}
                      {loc.key === 'VISION'  && 'VSP Vision Plan 2026 — VSP'}
                    </Text>
                  </div>
                </div>
                {inRenewal ? (
                  <Tag color="blue" style={{ borderRadius: 10, fontSize: 12, padding: '2px 10px' }}>
                    In Renewal
                  </Tag>
                ) : activeRenewal ? (
                  <Tag
                    icon={<SyncOutlined />}
                    style={{ borderRadius: 10, fontSize: 12, padding: '2px 10px', color: '#6b7280', borderColor: '#d1d5db' }}
                  >
                    Not Renewing This Cycle
                  </Tag>
                ) : (
                  <Tag style={{ borderRadius: 10, fontSize: 12, padding: '2px 10px', color: '#9ca3af' }}>
                    No Active Renewal
                  </Tag>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 24px' }}>
                {inRenewal ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                    {/* Left: cycle details */}
                    <div style={{ flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        Current Cycle
                      </Text>
                      <div style={{ marginTop: 8, display: 'flex', gap: 24 }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>Effective Date</Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <CalendarOutlined style={{ color: meta.hex, fontSize: 12 }} />
                            <Text strong style={{ fontSize: 13 }}>
                              {cfg.effectiveDate?.format('MM/DD/YYYY')}
                            </Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>End Date</Text>
                          <div style={{ marginTop: 2 }}>
                            <Text style={{ fontSize: 13, color: '#6b7280' }}>
                              {cfg.effectiveDate
                                ? cfg.effectiveDate.add(1, 'year').subtract(1, 'day').format('MM/DD/YYYY')
                                : '—'}
                            </Text>
                          </div>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>Offers</Text>
                          <div style={{ marginTop: 2 }}>
                            <Text style={{ fontSize: 13, color: '#6b7280' }}>0 offers</Text>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: stage progress */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                        Stage
                      </Text>
                      <StageProgress currentStage={0} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {activeRenewal
                        ? 'This LOC is not included in the current renewal cycle. Current plans remain active and can be renewed in a future cycle.'
                        : 'No active renewal cycle. Start a new renewal to include this LOC.'}
                    </Text>
                  </div>
                )}

                {/* Previous cycle */}
                <Divider style={{ margin: '16px 0 12px' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Previous Cycle
                  </Text>
                  <div style={{
                    marginTop: 8, display: 'flex', alignItems: 'center', gap: 24,
                    padding: '10px 14px', background: '#f9fafb', borderRadius: 6,
                  }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Effective</Text>
                      <div style={{ marginTop: 1 }}>
                        <Text style={{ fontSize: 13 }}>{PREV_CYCLE.effectiveDate}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}> – {PREV_CYCLE.endDate}</Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>AFP Completed</Text>
                      <div style={{ marginTop: 1 }}>
                        <Text style={{ fontSize: 13, color: '#6b7280' }}>{PREV_CYCLE.completedDate}</Text>
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Tag
                        icon={<CheckCircleFilled />}
                        color="success"
                        style={{ borderRadius: 10, fontSize: 11 }}
                      >
                        AFP Complete
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Back link */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ color: '#6b7280', fontWeight: 500 }}
        >
          Back to Start Renewal
        </Button>
      </div>
    </div>
  )
}
