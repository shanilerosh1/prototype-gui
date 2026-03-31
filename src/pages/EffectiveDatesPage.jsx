import { useState } from 'react'
import { Typography, Tag, Layout, Menu, Tabs, Tooltip } from 'antd'
import {
  DashboardOutlined, InfoCircleOutlined, UnorderedListOutlined,
  BankOutlined, FileTextOutlined, TeamOutlined, CreditCardOutlined,
  AuditOutlined, FileOutlined, BarChartOutlined, ReloadOutlined,
  MedicineBoxOutlined, SmileOutlined, EyeOutlined,
  CheckCircleFilled, ClockCircleOutlined, MinusCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Sider, Content } = Layout

const LOC_META = {
  MEDICAL: { icon: <MedicineBoxOutlined />, hex: '#1a56db', bg: '#eff6ff', label: 'Medical', plan: 'BSC PPO Gold — Blue Shield of California' },
  DENTAL:  { icon: <SmileOutlined />,        hex: '#0e9f6e', bg: '#f0fdf4', label: 'Dental',  plan: 'Delta Dental PPO — Delta Dental' },
  VISION:  { icon: <EyeOutlined />,          hex: '#7e3af2', bg: '#faf5ff', label: 'Vision',  plan: 'VSP Vision Plan — VSP' },
}

// Historical effective dates per LOC (hardcoded for prototype)
const HISTORY = {
  MEDICAL:  [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  DENTAL:   [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
  VISION:   [{ date: '01/01/2025', status: 'expired' }, { date: '01/01/2026', status: 'active' }],
}

const STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    color: '#1a56db',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: <ClockCircleOutlined />,
    note: 'Set via active renewal',
  },
  active: {
    label: 'Active',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: <CheckCircleFilled />,
    note: 'Currently active',
  },
  expired: {
    label: 'Expired',
    color: '#9ca3af',
    bg: '#f9fafb',
    border: '#e5e7eb',
    icon: <MinusCircleOutlined />,
    note: 'Superseded by next effective date',
  },
}

function EffectiveDateRow({ date, status, note, isLast }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '120px 160px 1fr',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
      gap: 16,
    }}>
      {/* Status badge */}
      <div>
        <Tag
          icon={cfg.icon}
          style={{
            color: cfg.color, background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 20, fontSize: 12,
            padding: '2px 10px', fontWeight: 600,
          }}
        >
          {cfg.label}
        </Tag>
      </div>

      {/* Effective date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <CalendarOutlined style={{ color: cfg.color, fontSize: 13 }} />
        <Text style={{
          fontSize: 14,
          fontWeight: status === 'active' ? 700 : 500,
          color: status === 'expired' ? '#9ca3af' : '#111827',
        }}>
          {date}
        </Text>
      </div>

      {/* Note */}
      <Text style={{ fontSize: 12, color: '#9ca3af' }}>
        {note || cfg.note}
      </Text>
    </div>
  )
}

function LOCSection({ locKey, config }) {
  const meta    = LOC_META[locKey]
  const locCfg  = config?.find((l) => l.key === locKey)
  const inRenewal = locCfg?.selected === true

  // Build the full list of dates for this LOC: history + upcoming if in renewal
  const rows = []

  if (inRenewal && locCfg?.effectiveDate) {
    rows.push({
      date: locCfg.effectiveDate.format('MM/DD/YYYY'),
      status: 'upcoming',
      note: 'Set via active renewal',
    })
  }

  const history = [...(HISTORY[locKey] || [])].reverse() // most recent first
  history.forEach((h) => rows.push(h))

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${meta.hex}`,
      borderRadius: 10, overflow: 'hidden',
      marginBottom: 20,
      background: '#fff',
    }}>
      {/* LOC header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        background: inRenewal ? meta.bg : '#fafafa',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: meta.hex + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: meta.hex, fontSize: 16,
          }}>
            {meta.icon}
          </div>
          <div>
            <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{meta.label}</Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{meta.plan}</Text>
          </div>
        </div>
        {inRenewal
          ? <Tag color="blue" style={{ borderRadius: 20, fontSize: 12, padding: '2px 10px' }}>In Renewal</Tag>
          : <Tag style={{ borderRadius: 20, fontSize: 12, color: '#6b7280', borderColor: '#d1d5db' }}>Not in current renewal</Tag>
        }
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '120px 160px 1fr',
        gap: 16, padding: '8px 24px',
        background: '#fafafa', borderBottom: '1px solid #f3f4f6',
      }}>
        <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</Text>
        <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Effective Date</Text>
        <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</Text>
      </div>

      {/* Date rows */}
      <div style={{ padding: '0 24px' }}>
        {rows.map((row, i) => (
          <EffectiveDateRow
            key={`${row.date}-${row.status}`}
            date={row.date}
            status={row.status}
            note={row.note}
            isLast={i === rows.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

export default function EffectiveDatesPage({ config, onBack }) {
  const [activeTab, setActiveTab] = useState('effective-dates')

  const tabs = [
    { key: 'employer-users',   label: 'Employer Users'  },
    { key: 'effective-dates',  label: 'Effective Dates' },
    { key: 'benefit-classes',  label: 'Benefit Classes' },
    { key: 'basic-info',       label: 'Basic Info'      },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Sidebar */}
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
        <div style={{ padding: '20px 16px 0' }}>
          <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>
            Release Testing &gt; EMPLOYER
          </Text>
          <div style={{
            background: '#1a2332', color: '#fff', borderRadius: 4,
            padding: '4px 12px', fontWeight: 700, fontSize: 13,
            display: 'inline-block', marginBottom: 12,
          }}>
            APEX
          </div>
          <br />
          <Tag style={{ fontSize: 11, borderRadius: 10 }}>LARGE GROUP</Tag>
        </div>
        <Menu
          mode="inline"
          selectedKeys={['employer']}
          style={{ border: 'none', marginTop: 8 }}
          items={[
            { key: 'dashboard', label: 'Dashboard',         icon: <DashboardOutlined /> },
            { key: 'employer',  label: 'Employer Details',  icon: <InfoCircleOutlined /> },
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
          <Text
            style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={onBack}
          >
            ← {config ? 'Back to Carrier Offers' : 'All Employers'}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Apex Solutions Inc</Text>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 24px', fontSize: 14,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? '#111827' : '#6b7280',
                  borderBottom: activeTab === tab.key ? '2px solid #1a2332' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
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
            {/* Section description */}
            <div style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: '#111827', display: 'block', marginBottom: 6 }}>
                Effective Dates
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Each Line of Coverage maintains its own effective date history.
                Dates are set independently through the renewal cycle — there is no single shared plan year closing date.
              </Text>
            </div>

            {/* Summary row */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap',
            }}>
              {[
                { label: 'LOCs with upcoming dates', value: config?.filter((l) => l.selected).length ?? 0, color: '#1a56db', bg: '#eff6ff' },
                { label: 'LOCs active (no renewal)', value: config?.filter((l) => !l.selected).length ?? 3, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Total LOCs tracked', value: 3, color: '#6b7280', bg: '#f9fafb' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: 8, padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${s.color}20`,
                }}>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, color: s.color, maxWidth: 100, lineHeight: 1.4 }}>{s.label}</Text>
                </div>
              ))}
            </div>

            {/* Per-LOC sections */}
            {['MEDICAL', 'DENTAL', 'VISION'].map((key) => (
              <LOCSection key={key} locKey={key} config={config} />
            ))}
          </div>
        )}
      </Content>
    </Layout>
  )
}
