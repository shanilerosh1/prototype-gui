import { useState } from 'react'
import {
  Typography, Button, Tag, Tooltip, Modal, message, Divider, Layout, Menu, Dropdown,
} from 'antd'
import {
  MedicineBoxOutlined, SmileOutlined, EyeOutlined,
  PlusOutlined, UploadOutlined, FileTextOutlined,
  DownOutlined, SyncOutlined, CalendarOutlined,
  DashboardOutlined, InfoCircleOutlined, TeamOutlined,
  FileOutlined, CreditCardOutlined, BarChartOutlined,
  ClockCircleOutlined, BankOutlined, AuditOutlined,
  ReloadOutlined, UnorderedListOutlined, CheckCircleOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Sider, Content } = Layout

const LOC_META = {
  MEDICAL: { icon: <MedicineBoxOutlined />, hex: '#1a56db' },
  DENTAL:  { icon: <SmileOutlined />,        hex: '#0e9f6e' },
  VISION:  { icon: <EyeOutlined />,          hex: '#7e3af2' },
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',         icon: <DashboardOutlined /> },
  { key: 'employer',  label: 'Employer Details',  icon: <InfoCircleOutlined /> },
  { type: 'divider' },
  { key: 'g1', label: 'BENEFITS', type: 'group', children: [
    { key: 'plans',    label: 'Plans',    icon: <UnorderedListOutlined /> },
    { key: 'carriers', label: 'Carriers', icon: <BankOutlined /> },
  ]},
  { key: 'g2', label: 'EMPLOYEE TOOLS', type: 'group', children: [
    { key: 'ben-guides',    label: 'Benefits Guides',       icon: <FileTextOutlined /> },
    { key: 'ben-consult',   label: 'Benefits Consultation', icon: <TeamOutlined /> },
    { key: 'id-cards',      label: 'ID Cards',              icon: <CreditCardOutlined /> },
  ]},
  { key: 'g3', label: 'EMPLOYER TOOLS', type: 'group', children: [
    { key: 'account-log', label: 'Account Log',  icon: <AuditOutlined /> },
    { key: 'billing',     label: 'Billing',      icon: <CreditCardOutlined /> },
    { key: 'claims',      label: 'Claims',       icon: <FileOutlined /> },
    { key: 'plan-rates',  label: 'Plan Rates',   icon: <BarChartOutlined /> },
    { key: 'documents',   label: 'Documents',    icon: <FileOutlined /> },
  ]},
  { key: 'g4', label: 'RENEWALS', type: 'group', children: [
    { key: 'carrier-offers', label: 'Carrier Offers', icon: <ReloadOutlined /> },
    { key: 'proposals',      label: 'Proposals',      icon: <FileTextOutlined /> },
  ]},
]

export default function CarrierOffersPage({ config, onCompleteAFP, onGoToEffectiveDates, onGoToRenewalCycles }) {
  const [addOfferModal, setAddOfferModal] = useState(null)

  const hasActiveRenewal = config?.some((l) => l.selected)
  const getLocConfig = (key) => config?.find((l) => l.key === key)

  const allLocs = [
    { key: 'MEDICAL', label: 'Medical' },
    { key: 'DENTAL',  label: 'Dental'  },
    { key: 'VISION',  label: 'Vision'  },
  ]

  // Build effective date filter options from config — one per selected carrier
  const effectiveDateOptions = [
    { value: 'all', label: 'All' },
    ...allLocs.flatMap((loc) => {
      const cfg = getLocConfig(loc.key)
      if (!cfg?.selected) return []
      return (cfg.carriers || [])
        .filter((c) => c.selected && c.effectiveDate)
        .map((c) => ({
          value: `${loc.key}.${c.key}`,
          label: `${c.name} - ${loc.label} - ${c.effectiveDate.format('M/D/YYYY')}`,
          locKey: loc.key,
          carrierKey: c.key,
        }))
    }),
  ]

  // Default to the first carrier's effective date option (not "All") when a renewal is active
  const defaultFilter = effectiveDateOptions.find((o) => o.value !== 'all')?.value ?? 'all'
  const [effectiveDateFilter, setEffectiveDateFilter] = useState(defaultFilter)

  // Build carrier-level table rows (one row per carrier for in-renewal LOCs)
  const tableRows = allLocs.flatMap((loc) => {
    const cfg = getLocConfig(loc.key)
    const meta = LOC_META[loc.key]
    if (!cfg?.selected) {
      return [{ type: 'not-renewing', loc, cfg, meta, id: loc.key }]
    }
    const selectedCarriers = (cfg.carriers || []).filter((c) => c.selected)
    if (selectedCarriers.length === 0) {
      return [{ type: 'not-renewing', loc, cfg, meta, id: loc.key }]
    }
    return selectedCarriers.map((carrier) => ({
      type: 'carrier',
      loc,
      cfg,
      meta,
      carrier,
      id: `${loc.key}.${carrier.key}`,
    }))
  })

  // Apply filter
  const filteredRows = effectiveDateFilter === 'all'
    ? tableRows
    : tableRows.filter((row) =>
        row.type === 'not-renewing' ? false : row.id === effectiveDateFilter
      )

  const handleAddOffer = (loc, carrier) => {
    const cfg = getLocConfig(loc.key)
    if (!cfg?.selected) return
    setAddOfferModal({ ...loc, effectiveDate: carrier?.effectiveDate, carrierName: carrier?.name })
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Sidebar */}
      <Sider width={240} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
        {/* Employer badge */}
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

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={['carrier-offers']}
          defaultOpenKeys={['g4']}
          style={{ border: 'none', marginTop: 8 }}
          items={[
            { key: 'dashboard', label: 'Dashboard',         icon: <DashboardOutlined /> },
            { key: 'employer',  label: 'Employer Details',  icon: <InfoCircleOutlined />, onClick: onGoToEffectiveDates },
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
              { key: 'renewal-cycles', label: 'Manage Renewals', icon: <BarChartOutlined />, onClick: onGoToRenewalCycles },
              { key: 'carrier-offers', label: 'Carrier Offers', icon: <ReloadOutlined /> },
              { key: 'proposals',      label: 'Proposals',      icon: <FileTextOutlined /> },
            ]},
          ]}
        />
      </Sider>

      {/* Main content */}
      <Content style={{ padding: '32px 40px', background: '#fff', minHeight: '100vh' }}>

        {/* No renewal banner */}
        {!hasActiveRenewal && (
          <div style={{
            background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 8,
            padding: '12px 20px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <Text style={{ fontSize: 13, color: '#374151' }}>No Ongoing Renewals</Text>
            <Button onClick={onGoToRenewalCycles} style={{ fontWeight: 600, flexShrink: 0 }}>
              Manage Renewals
            </Button>
          </div>
        )}

        {/* Renewal active banner */}
        {hasActiveRenewal && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
            padding: '12px 20px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
              <Text style={{ fontSize: 13, color: '#166534' }}>
                <Text strong style={{ color: '#166534' }}>Renewal in progress.</Text>
                {' '}Once offers and proposals are finalized, create the new plan year.
              </Text>
            </div>
            <Button
              type="primary"
              onClick={onCompleteAFP}
              style={{ background: '#1a2332', borderColor: '#1a2332', fontWeight: 600, flexShrink: 0 }}
            >
              Finalize Plan Year
            </Button>
          </div>
        )}


        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#111827', display: 'block', marginBottom: 12 }}>
              Carrier Offers
            </Text>
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Effective Dates:</Text>
              <Dropdown
                trigger={['click']}
                menu={{
                  items: effectiveDateOptions.map((opt) => ({
                    key: opt.value,
                    label: opt.label,
                    icon: opt.value === effectiveDateFilter
                      ? <span style={{ color: '#1a56db', marginRight: 4 }}>✓</span>
                      : <span style={{ marginRight: 4, display: 'inline-block', width: 14 }} />,
                  })),
                  onClick: ({ key }) => setEffectiveDateFilter(key),
                  style: { minWidth: 280 },
                }}
              >
                <Button
                  type="link"
                  size="small"
                  style={{ padding: '0 4px', fontWeight: 600, color: '#1a56db', fontSize: 13 }}
                >
                  {effectiveDateOptions.find((o) => o.value === effectiveDateFilter)?.label ?? 'All'}
                  {' '}<DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
            <Button icon={<DownOutlined />} style={{ fontWeight: 600, background: '#1a2332', color: '#fff', border: 'none' }}>
              Actions
            </Button>
            <Button icon={<UploadOutlined />} style={{ fontWeight: 600 }}>
              Upload Carrier Proposal
            </Button>
            <Button icon={<FileTextOutlined />} style={{ fontWeight: 600 }}>
              Document Status
            </Button>
          </div>
        </div>

        {/* Carrier Offers Due */}
        <div style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 10 }}>
            Carrier Offers Due
          </Text>
          <Button style={{ borderRadius: 6 }}>Set Due Date</Button>
        </div>

        {/* Offers Summary */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Offers Summary</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Group Offers by Carrier</Text>
              <div style={{
                width: 36, height: 20, background: '#e5e7eb', borderRadius: 10,
                position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  width: 16, height: 16, background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: 2, left: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ position: 'relative' }}>
          {!hasActiveRenewal && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                padding: '40px 48px', textAlign: 'center', maxWidth: 580, minHeight: 240,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
              }}>
                <ReloadOutlined style={{ fontSize: 36, color: '#1a56db' }} />
                <Text style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                  You don't have any Renewal Data
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                  Get started by beginning a renewal process.
                </Text>
                <Button
                  size="large"
                  onClick={onGoToRenewalCycles}
                  style={{ fontWeight: 600, background: '#1a2332', color: '#fff', border: 'none', marginTop: 4, width: '100%' }}
                >
                  Manage Renewals
                </Button>
              </div>
            </div>
          )}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '220px 1px 1fr 200px 140px 160px',
              background: '#fafafa',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ padding: '10px 16px' }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Benefit Type
                </Text>
              </div>
              <div style={{ background: '#e5e7eb' }} />
              <div style={{ padding: '10px 16px' }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Carrier / Offer Name
                </Text>
              </div>
              <div style={{ padding: '10px 16px' }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  # Plans
                </Text>
              </div>
              <div style={{ padding: '10px 16px' }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Est. Annual Prem.
                </Text>
              </div>
              <div style={{ padding: '10px 16px' }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  From Current
                </Text>
              </div>
            </div>

            {/* Rows */}
            {filteredRows.map((row, i) => {
              const { loc, meta, carrier } = row
              const isNotRenewing = row.type === 'not-renewing'
              const isLast = i === filteredRows.length - 1
              const effDate = carrier?.effectiveDate

              return (
                <div
                  key={row.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1px 1fr 200px 140px 160px',
                    borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
                    alignItems: 'center',
                    background: isNotRenewing ? '#fafafa' : '#fff',
                    opacity: isNotRenewing ? 0.7 : 1,
                    minHeight: 70,
                  }}
                >
                  {/* Benefit type cell */}
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: isNotRenewing ? '#9ca3af' : meta.hex, fontSize: 16 }}>
                        {meta.icon}
                      </span>
                      <div>
                        <Text style={{ fontWeight: 600, fontSize: 14, color: isNotRenewing ? '#9ca3af' : '#111827', display: 'block' }}>
                          {loc.label}
                        </Text>
                        {!isNotRenewing && (
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>{carrier.name}</Text>
                        )}
                      </div>
                    </div>
                    {isNotRenewing ? (
                      <Tag icon={<SyncOutlined />} style={{ fontSize: 11, borderRadius: 10, color: '#6b7280', borderColor: '#d1d5db' }}>
                        Not Renewing
                      </Tag>
                    ) : (
                      <Tag icon={<CalendarOutlined />} color="blue" style={{ fontSize: 11, borderRadius: 10 }}>
                        Eff. {effDate?.format('MM/DD/YYYY')}
                      </Tag>
                    )}
                  </div>

                  {/* Vertical divider */}
                  <div style={{ background: '#e5e7eb', alignSelf: 'stretch' }} />

                  {/* Carrier / offer name + actions */}
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {isNotRenewing ? (
                      <Text style={{ color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>
                        No renewal — current plans remain active
                      </Text>
                    ) : (
                      <Text style={{ color: '#9ca3af', fontSize: 13 }}>Currently no offers</Text>
                    )}
                    {isNotRenewing ? (
                      <Tooltip title={`${loc.label} is not being renewed this cycle.`}>
                        <Button size="small" disabled icon={<PlusOutlined />} style={{ marginLeft: 12 }}>
                          Add Offer
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button
                        size="small" type="primary" ghost
                        icon={<PlusOutlined />}
                        onClick={() => handleAddOffer(loc, carrier)}
                        style={{ marginLeft: 12, borderColor: meta.hex, color: meta.hex }}
                      >
                        Add Offer
                      </Button>
                    )}
                  </div>

                  {/* # Plans */}
                  <div style={{ padding: '16px' }}>
                    <Text style={{ color: '#9ca3af', fontSize: 13 }}>—</Text>
                  </div>

                  {/* Est. annual */}
                  <div style={{ padding: '16px' }}>
                    <Text style={{ color: '#9ca3af', fontSize: 13 }}>—</Text>
                  </div>

                  {/* From current */}
                  <div style={{ padding: '16px' }}>
                    <Text style={{ color: '#9ca3af', fontSize: 13 }}>—</Text>
                  </div>
                </div>
              )
            })}
          </div>
          </div>{/* end relative wrapper */}
        </div>
      </Content>

      {/* Add Offer modal */}
      <Modal
        open={!!addOfferModal}
        title={addOfferModal && `Add ${addOfferModal.label} Offer`}
        onCancel={() => setAddOfferModal(null)}
        footer={[
          <Button key="cancel" onClick={() => setAddOfferModal(null)}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => {
            message.success(`${addOfferModal?.label} offer wizard would open here.`)
            setAddOfferModal(null)
          }}>
            Continue to Offer Wizard
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {addOfferModal?.carrierName && (
              <Tag style={{ borderRadius: 10, fontSize: 12 }}>{addOfferModal.carrierName}</Tag>
            )}
            <Tag color="blue" icon={<CalendarOutlined />} style={{ borderRadius: 10 }}>
              Effective: {addOfferModal?.effectiveDate?.format('MM/DD/YYYY')}
            </Tag>
          </div>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
            In the real flow, this opens the Add Offer wizard for <Text strong>{addOfferModal?.label}</Text> with
            plan upload and rate entry steps.
          </Text>
        </div>
      </Modal>
    </Layout>
  )
}
