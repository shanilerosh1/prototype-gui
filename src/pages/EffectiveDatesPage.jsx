import { useState } from 'react'
import { Typography, Tag, Layout, Menu } from 'antd'
import {
  DashboardOutlined, InfoCircleOutlined, UnorderedListOutlined,
  BankOutlined, FileTextOutlined, TeamOutlined, CreditCardOutlined,
  AuditOutlined, FileOutlined, BarChartOutlined, ReloadOutlined,
  MedicineBoxOutlined, SmileOutlined, EyeOutlined,
  ShopOutlined, SafetyCertificateOutlined,
  CheckCircleFilled, ClockCircleOutlined, MinusCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Sider, Content } = Layout

const LOC_META = {
  MEDICAL:          { icon: <MedicineBoxOutlined />,       hex: '#1a56db', bg: '#eff6ff', label: 'Medical'          },
  DENTAL:           { icon: <SmileOutlined />,             hex: '#0e9f6e', bg: '#f0fdf4', label: 'Dental'           },
  VISION:           { icon: <EyeOutlined />,               hex: '#7e3af2', bg: '#faf5ff', label: 'Vision'           },
  WORKSITE:         { icon: <ShopOutlined />,              hex: '#d97706', bg: '#fffbeb', label: 'Worksite'         },
  LIFE_DISABILITY:  { icon: <SafetyCertificateOutlined />, hex: '#dc2626', bg: '#fff1f2', label: 'Life & Disability' },
}

// All LOCs and their carriers (system-wide)
const ALL_LOCS = [
  { key: 'MEDICAL',         carriers: [{ key: 'ANTHEM', name: 'Anthem Blue Cross' }, { key: 'AETNA', name: 'Aetna' }] },
  { key: 'DENTAL',          carriers: [{ key: 'DELTA',  name: 'Delta Dental'      }] },
  { key: 'VISION',          carriers: [{ key: 'VSP',    name: 'VSP'               }] },
  { key: 'LIFE_DISABILITY', carriers: [{ key: 'SUN',    name: 'Sun Life'          }] },
  { key: 'WORKSITE',        carriers: [{ key: 'AFLAC',  name: 'Aflac'             }] },
]

// Historical effective dates per carrier
const CARRIER_HISTORY = {
  'MEDICAL.ANTHEM':       [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  'MEDICAL.AETNA':        [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  'DENTAL.DELTA':         [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  'VISION.VSP':           [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  'LIFE_DISABILITY.SUN':  [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  'WORKSITE.AFLAC':       [{ date: '01/01/2026', status: 'active' }],
}

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: '#1a56db', bg: '#eff6ff', border: '#bfdbfe', icon: <ClockCircleOutlined />, note: 'Set via active renewal' },
  active:   { label: 'Active',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircleFilled />,  note: 'Currently active'       },
  expired:  { label: 'Expired',  color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', icon: <MinusCircleOutlined />,note: 'Superseded by next effective date' },
}

function DateRow({ date, status, note, isLast }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '110px 150px 1fr',
      alignItems: 'center', padding: '11px 0',
      borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
      gap: 16,
    }}>
      <Tag icon={cfg.icon} style={{
        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 20, fontSize: 11, padding: '2px 8px', fontWeight: 600, width: 'fit-content',
      }}>
        {cfg.label}
      </Tag>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <CalendarOutlined style={{ color: cfg.color, fontSize: 12 }} />
        <Text style={{ fontSize: 13, fontWeight: status === 'active' ? 700 : 500, color: status === 'expired' ? '#9ca3af' : '#111827' }}>
          {date}
        </Text>
      </div>
      <Text style={{ fontSize: 12, color: '#9ca3af' }}>{note || cfg.note}</Text>
    </div>
  )
}

function CarrierSection({ locKey, carrier, configCarrier, locHex, isLast }) {
  const inRenewal = configCarrier?.selected === true

  // Build rows: upcoming (from config) + history (most recent first)
  const rows = []
  if (inRenewal && configCarrier?.effectiveDate) {
    rows.push({ date: configCarrier.effectiveDate.format('MM/DD/YYYY'), status: 'upcoming', note: 'Set via active renewal' })
  }
  const history = [...(CARRIER_HISTORY[`${locKey}.${carrier.key}`] || [])].reverse()
  history.forEach((h) => rows.push(h))

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid #f0f1f3' }}>
      {/* Carrier sub-header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: inRenewal ? locHex + '05' : '#fafafa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: inRenewal ? locHex : '#d1d5db', flexShrink: 0 }} />
          <Text style={{ fontWeight: 600, fontSize: 13, color: inRenewal ? '#111827' : '#6b7280' }}>
            {carrier.name}
          </Text>
        </div>
        {inRenewal
          ? <Tag color="blue" style={{ borderRadius: 10, fontSize: 11 }}>In Renewal</Tag>
          : <Tag style={{ borderRadius: 10, fontSize: 11, color: '#9ca3af', borderColor: '#e5e7eb' }}>No Active Renewal</Tag>
        }
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '110px 150px 1fr',
        gap: 16, padding: '6px 24px',
        background: '#fafafa', borderBottom: '1px solid #f3f4f6', borderTop: '1px solid #f3f4f6',
      }}>
        {['Status', 'Effective Date', 'Notes'].map((h) => (
          <Text key={h} style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {h}
          </Text>
        ))}
      </div>

      {/* Date rows */}
      <div style={{ padding: '0 24px' }}>
        {rows.map((row, i) => (
          <DateRow
            key={`${row.date}-${row.status}`}
            date={row.date} status={row.status} note={row.note}
            isLast={i === rows.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function LOCSection({ loc, config }) {
  const meta    = LOC_META[loc.key]
  const cfgLoc  = config?.find((l) => l.key === loc.key)
  const anyInRenewal = loc.carriers.some((c) => cfgLoc?.carriers?.find((cc) => cc.key === c.key)?.selected)

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${anyInRenewal ? meta.hex : '#d1d5db'}`,
      borderRadius: 10, overflow: 'hidden',
      marginBottom: 24, background: '#fff',
    }}>
      {/* LOC header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        background: anyInRenewal ? meta.bg : '#fafafa',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: anyInRenewal ? meta.hex + '20' : '#f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: anyInRenewal ? meta.hex : '#9ca3af', fontSize: 16,
          }}>
            {meta.icon}
          </div>
          <div>
            <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{meta.label}</Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {loc.carriers.length} carrier{loc.carriers.length > 1 ? 's' : ''}
              {anyInRenewal && ` · ${loc.carriers.filter((c) => cfgLoc?.carriers?.find((cc) => cc.key === c.key)?.selected).length} in renewal`}
            </Text>
          </div>
        </div>
        {anyInRenewal
          ? <Tag color="blue" style={{ borderRadius: 20, fontSize: 12, padding: '2px 10px' }}>In Renewal</Tag>
          : <Tag style={{ borderRadius: 20, fontSize: 12, color: '#6b7280', borderColor: '#d1d5db' }}>Not in current renewal</Tag>
        }
      </div>

      {/* Carrier sections */}
      {loc.carriers.map((carrier, i) => {
        const cfgCarrier = cfgLoc?.carriers?.find((cc) => cc.key === carrier.key)
        return (
          <CarrierSection
            key={carrier.key}
            locKey={loc.key}
            carrier={carrier}
            configCarrier={cfgCarrier}
            locHex={meta.hex}
            isLast={i === loc.carriers.length - 1}
          />
        )
      })}
    </div>
  )
}

export default function EffectiveDatesPage({ config, onBack }) {
  const [activeTab, setActiveTab] = useState('effective-dates')

  const tabs = [
    { key: 'employer-users',  label: 'Employer Users'  },
    { key: 'effective-dates', label: 'Effective Dates' },
    { key: 'benefit-classes', label: 'Benefit Classes' },
    { key: 'basic-info',      label: 'Basic Info'      },
  ]

  // Summary counts (carrier-level)
  const totalCarriers = ALL_LOCS.reduce((sum, l) => sum + l.carriers.length, 0)
  const carriersInRenewal = config
    ? config.flatMap((l) => (l.carriers || []).filter((c) => c.selected)).length
    : 0

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Sidebar */}
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
        <div style={{ padding: '20px 16px 0' }}>
          <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>
            Release Testing &gt; EMPLOYER
          </Text>
          <div style={{ background: '#1a2332', color: '#fff', borderRadius: 4, padding: '4px 12px', fontWeight: 700, fontSize: 13, display: 'inline-block', marginBottom: 12 }}>
            APEX
          </div>
          <br />
          <Tag style={{ fontSize: 11, borderRadius: 10 }}>LARGE GROUP</Tag>
        </div>
        <Menu
          mode="inline" selectedKeys={['employer']}
          style={{ border: 'none', marginTop: 8 }}
          items={[
            { key: 'dashboard', label: 'Dashboard',        icon: <DashboardOutlined /> },
            { key: 'employer',  label: 'Employer Details', icon: <InfoCircleOutlined /> },
            { key: 'g1', label: 'BENEFITS', type: 'group', children: [
              { key: 'plans',    label: 'Plans',    icon: <UnorderedListOutlined /> },
              { key: 'carriers', label: 'Carriers', icon: <BankOutlined /> },
            ]},
            { key: 'g2', label: 'EMPLOYEE TOOLS', type: 'group', children: [
              { key: 'ben-guides',  label: 'Benefits Guides',       icon: <FileTextOutlined /> },
              { key: 'ben-consult', label: 'Benefits Consultation', icon: <TeamOutlined /> },
              { key: 'id-cards',    label: 'ID Cards',              icon: <CreditCardOutlined /> },
            ]},
            { key: 'g3', label: 'EMPLOYER TOOLS', type: 'group', children: [
              { key: 'account-log', label: 'Account Log', icon: <AuditOutlined /> },
              { key: 'billing',     label: 'Billing',     icon: <CreditCardOutlined /> },
              { key: 'claims',      label: 'Claims',      icon: <FileOutlined /> },
              { key: 'plan-rates',  label: 'Plan Rates',  icon: <BarChartOutlined /> },
              { key: 'documents',   label: 'Documents',   icon: <FileOutlined /> },
            ]},
            { key: 'g4', label: 'RENEWALS', type: 'group', children: [
              { key: 'carrier-offers', label: 'Carrier Offers', icon: <ReloadOutlined />, onClick: onBack ?? undefined },
              { key: 'proposals',      label: 'Proposals',      icon: <FileTextOutlined /> },
            ]},
          ]}
        />
      </Sider>

      {/* Main content */}
      <Content style={{ padding: '32px 48px', background: '#fff', minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={onBack}>
            ← {config ? 'Back to Carrier Offers' : 'All Employers'}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Apex Solutions Inc</Text>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 32 }}>
          <div style={{ display: 'flex' }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 24px', fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#111827' : '#6b7280',
                borderBottom: activeTab === tab.key ? '2px solid #1a2332' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Non-active tabs placeholder */}
        {activeTab !== 'effective-dates' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 240, border: '1px dashed #e5e7eb', borderRadius: 10,
            color: '#9ca3af', fontSize: 14,
          }}>
            {tabs.find((t) => t.key === activeTab)?.label} — not in scope for this prototype
          </div>
        )}

        {activeTab === 'effective-dates' && (
          <div>
            {/* Section header */}
            <div style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: '#111827', display: 'block', marginBottom: 6 }}>
                Effective Dates
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Each carrier maintains its own effective date history independently.
                Dates are set at the carrier level through the renewal cycle — there is no single shared plan year closing date.
              </Text>
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Carriers with upcoming dates', value: carriersInRenewal,                       color: '#1a56db', bg: '#eff6ff' },
                { label: 'Carriers active (no renewal)', value: totalCarriers - carriersInRenewal,        color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Total carriers tracked',       value: totalCarriers,                            color: '#6b7280', bg: '#f9fafb' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: 8, padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${s.color}20`,
                }}>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, color: s.color, maxWidth: 110, lineHeight: 1.4 }}>{s.label}</Text>
                </div>
              ))}
            </div>

            {/* Per-LOC sections */}
            {ALL_LOCS.map((loc) => (
              <LOCSection key={loc.key} loc={loc} config={config} />
            ))}
          </div>
        )}
      </Content>
    </Layout>
  )
}
