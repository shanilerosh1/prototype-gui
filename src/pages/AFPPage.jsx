import { useState } from 'react'
import { Typography, Button, Tag, Alert, Divider, Modal, Checkbox } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  SmileOutlined,
  EyeOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const LOC_META = {
  MEDICAL: { icon: <MedicineBoxOutlined />, hex: '#1a56db', bg: '#eff6ff' },
  DENTAL:  { icon: <SmileOutlined />,        hex: '#0e9f6e', bg: '#f0fdf4' },
  VISION:  { icon: <EyeOutlined />,          hex: '#7e3af2', bg: '#faf5ff' },
}

export default function AFPPage({ config, onBack, onComplete }) {
  // Build flat carrier rows from config
  const inRenewalCarriers = []    // LOC selected + carrier selected → broker can choose to finalize now or later
  const notInRenewalCarriers = [] // LOC not selected OR carrier not selected → always copied, not selectable

  config.forEach((loc) => {
    const locMeta = LOC_META[loc.key] || { icon: null, hex: '#6b7280', bg: '#f9fafb' }
    if (!loc.selected) {
      // Entire LOC not in renewal
      ;(loc.carriers || []).forEach((c) => {
        notInRenewalCarriers.push({ locKey: loc.key, locLabel: loc.label, locMeta, carrier: c, id: `${loc.key}.${c.key}` })
      })
    } else {
      ;(loc.carriers || []).forEach((c) => {
        const row = { locKey: loc.key, locLabel: loc.label, locMeta, carrier: c, id: `${loc.key}.${c.key}` }
        if (c.selected) inRenewalCarriers.push(row)
        else notInRenewalCarriers.push(row)
      })
    }
  })

  // Which in-renewal carriers the broker wants to finalize in this AFP run (default: all)
  const [afpSelected, setAfpSelected] = useState(
    Object.fromEntries(inRenewalCarriers.map((r) => [r.id, true]))
  )
  const [confirmModal, setConfirmModal] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const finalizing  = inRenewalCarriers.filter((r) => afpSelected[r.id])
  const keepingOpen = inRenewalCarriers.filter((r) => !afpSelected[r.id])
  const canProceed  = finalizing.length > 0

  const toggleAFP = (id, checked) =>
    setAfpSelected((prev) => ({ ...prev, [id]: checked }))

  const handleCompleteClick = () => {
    setAgreed(false)
    setConfirmModal(true)
  }

  // Short label for a carrier row: "Anthem Blue Cross (Medical)"
  const carrierLabel = (row) => `${row.carrier.name} (${row.locLabel})`

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Apex Solutions Inc &nbsp;›&nbsp; Renewals &nbsp;›&nbsp;
          <Text strong style={{ color: '#1a2332' }}>Finalize Plan Year</Text>
        </Text>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ marginBottom: 6 }}>Finalize Plan Year</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Select which carriers to finalize now.
          Any carrier left unselected will remain in renewal and can be finalized later.
        </Text>
      </div>

      {/* ── Section 1: In-renewal carriers ── */}
      <div style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
          Renewal will be finalized and updated as your current plan
        </Text>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 160px 160px',
            gap: 12, padding: '10px 20px', background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb', alignItems: 'center',
          }}>
            <div />
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Carrier / Line of Coverage
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Effective Date
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Action
            </Text>
          </div>

          {inRenewalCarriers.map((row, i) => {
            const { locMeta, carrier } = row
            const isSelected = afpSelected[row.id]
            const isLast     = i === inRenewalCarriers.length - 1

            return (
              <div
                key={row.id}
                onClick={() => toggleAFP(row.id, !isSelected)}
                style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 160px 160px',
                  gap: 12, padding: '16px 20px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
                  background: isSelected ? '#fff' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#fafafa' }}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => { e.stopPropagation(); toggleAFP(row.id, e.target.checked) }}
                />

                {/* Carrier + LOC info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    background: isSelected ? locMeta.bg : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? locMeta.hex : '#9ca3af', fontSize: 14,
                    transition: 'all 0.15s',
                  }}>
                    {locMeta.icon}
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600, fontSize: 14, color: isSelected ? '#111827' : '#9ca3af', display: 'block' }}>
                      {carrier.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: isSelected ? '#6b7280' : '#d1d5db' }}>
                      {row.locLabel}
                    </Text>
                  </div>
                </div>

                {/* Effective date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ color: isSelected ? locMeta.hex : '#d1d5db', fontSize: 12 }} />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#111827' : '#9ca3af' }}>
                    {carrier.effectiveDate?.format('MM/DD/YYYY')}
                  </Text>
                </div>

                {/* Action tag */}
                <div>
                  {isSelected ? (
                    <Tag icon={<CheckCircleOutlined />} color="blue" style={{ borderRadius: 10, fontSize: 11 }}>
                      Finalize now
                    </Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} style={{ borderRadius: 10, fontSize: 11, color: '#6b7280', borderColor: '#d1d5db' }}>
                      Keep in renewal
                    </Tag>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Warning when some carriers are left open */}
        {keepingOpen.length > 0 && (
          <Alert
            style={{ marginTop: 12, borderRadius: 8 }}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message={
              <Text>
                <Text strong>{keepingOpen.map(carrierLabel).join(' & ')}</Text>
                {keepingOpen.length === 1
                  ? ' will remain open until you finalize it'
                  : ' will remain open until you finalize them'}
              </Text>
            }
          />
        )}
      </div>

      {/* ── Section 2: Not in renewal — plans always copied, not selectable ── */}
      {notInRenewalCarriers.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
            Not in this renewal — existing plans will be copied to the new plan year
          </Text>

          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {notInRenewalCarriers.map((row, i) => {
              const { locMeta, carrier } = row
              const isLast = i === notInRenewalCarriers.length - 1
              return (
                <div key={row.id} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 160px 160px',
                  gap: 12, padding: '14px 20px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid #f9f9f9',
                  background: '#fafafa', opacity: 0.75,
                }}>
                  <SyncOutlined style={{ color: '#9ca3af', fontSize: 14 }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7, background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#9ca3af', fontSize: 14,
                    }}>
                      {locMeta.icon}
                    </div>
                    <div>
                      <Text style={{ fontWeight: 600, fontSize: 14, color: '#9ca3af', display: 'block' }}>
                        {carrier.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#d1d5db' }}>{row.locLabel}</Text>
                    </div>
                  </div>

                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>—</Text>

                  <Tag
                    icon={<SyncOutlined />}
                    style={{ borderRadius: 10, fontSize: 11, color: '#9ca3af', borderColor: '#e5e7eb' }}
                  >
                    Plans copied to new year
                  </Tag>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Divider style={{ margin: '0 0 24px' }} />

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <Button
          type="primary" size="large"
          disabled={!canProceed}
          onClick={handleCompleteClick}
          style={{
            width: '100%', height: 48, fontSize: 15, fontWeight: 600,
            background: canProceed ? '#1a2332' : undefined,
            borderColor: canProceed ? '#1a2332' : undefined,
            borderRadius: 8,
          }}
        >
          Finalize Plan Year
        </Button>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: '#6b7280', fontWeight: 500 }}>
          Back to Carrier Offers
        </Button>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={confirmModal}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleFilled style={{ color: '#16a34a', fontSize: 16 }} />
            <span>Confirm Finalization</span>
          </div>
        }
        onCancel={() => setConfirmModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmModal(false)}>Cancel</Button>,
          <Button
            key="agree"
            type="primary"
            disabled={!agreed}
            onClick={() => { setConfirmModal(false); onComplete() }}
            style={{ background: agreed ? '#1a2332' : undefined, borderColor: agreed ? '#1a2332' : undefined }}
          >
            Confirm & Finalize
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>

          {/* Finalizing */}
          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Finalizing
            </Text>
            {finalizing.map((row) => {
              const { locMeta, carrier } = row
              return (
                <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#f0fdf4', borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ color: locMeta.hex }}>{locMeta.icon}</span>
                  <div>
                    <Text strong style={{ fontSize: 13, display: 'block' }}>{carrier.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{row.locLabel}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                    Eff. {carrier.effectiveDate?.format('MM/DD/YYYY')}
                  </Text>
                  <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11 }}>
                    Finalize
                  </Tag>
                </div>
              )
            })}
          </div>

          {/* Keeping open */}
          {keepingOpen.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Staying in renewal
              </Text>
              {keepingOpen.map((row) => {
                const { locMeta, carrier } = row
                return (
                  <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ color: '#9ca3af' }}>{locMeta.icon}</span>
                    <div>
                      <Text style={{ fontSize: 13, color: '#6b7280', display: 'block' }}>{carrier.name}</Text>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>{row.locLabel}</Text>
                    </div>
                    <Tag icon={<ClockCircleOutlined />} style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11, color: '#6b7280' }}>
                      Remains open
                    </Tag>
                  </div>
                )
              })}
            </div>
          )}

          {/* Plans copied automatically */}
          {notInRenewalCarriers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Plans copied to new year automatically
              </Text>
              {notInRenewalCarriers.map((row) => {
                const { locMeta, carrier } = row
                return (
                  <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ color: '#9ca3af' }}>{locMeta.icon}</span>
                    <div>
                      <Text style={{ fontSize: 13, color: '#9ca3af', display: 'block' }}>{carrier.name}</Text>
                      <Text style={{ fontSize: 11, color: '#d1d5db' }}>{row.locLabel}</Text>
                    </div>
                    <Tag icon={<SyncOutlined />} style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11, color: '#9ca3af' }}>
                      Copied to new year
                    </Tag>
                  </div>
                )
              })}
            </div>
          )}

          {/* Agreement checkbox */}
          <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
            <Text style={{ fontSize: 13 }}>
              I confirm the above and am ready to finalize the plan year for{' '}
              <Text strong>{finalizing.map(carrierLabel).join(' & ')}</Text>.
            </Text>
          </Checkbox>
        </div>
      </Modal>
    </div>
  )
}
