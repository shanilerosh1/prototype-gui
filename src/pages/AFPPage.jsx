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
  const inRenewal = config.filter((l) => l.selected)
  const notInRenewal = config.filter((l) => !l.selected)

  // Which in-renewal LOCs the broker wants to finalize in this AFP run
  const [afpSelected, setAfpSelected] = useState(
    Object.fromEntries(inRenewal.map((l) => [l.key, true]))
  )
  const [confirmModal, setConfirmModal] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const finalizing  = inRenewal.filter((l) => afpSelected[l.key])
  const keepingOpen = inRenewal.filter((l) => !afpSelected[l.key])
  const canProceed  = finalizing.length > 0

  const toggleAFP = (key, checked) =>
    setAfpSelected((prev) => ({ ...prev, [key]: checked }))

  const handleCompleteClick = () => {
    setAgreed(false)
    setConfirmModal(true)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Apex Solutions Inc &nbsp;›&nbsp; Renewals &nbsp;›&nbsp;
          <Text strong style={{ color: '#1a2332' }}>Complete AFP</Text>
        </Text>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ marginBottom: 6 }}>Complete AFP</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Select which renewals to finalize in this AFP run.
          Any LOC left unselected will remain in renewal and can be finalized later.
        </Text>
      </div>

      {/* ── Section 1: In-renewal LOCs (broker chooses which to finalize) ── */}
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
              Line of Coverage
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Effective Date
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AFP Action
            </Text>
          </div>

          {inRenewal.map((loc, i) => {
            const meta       = LOC_META[loc.key]
            const isSelected = afpSelected[loc.key]
            const isLast     = i === inRenewal.length - 1

            return (
              <div
                key={loc.key}
                onClick={() => toggleAFP(loc.key, !isSelected)}
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
                  onChange={(e) => { e.stopPropagation(); toggleAFP(loc.key, e.target.checked) }}
                />

                {/* LOC info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    background: isSelected ? meta.bg : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? meta.hex : '#9ca3af', fontSize: 14,
                    transition: 'all 0.15s',
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <Text style={{ fontWeight: 600, fontSize: 14, color: isSelected ? '#111827' : '#9ca3af' }}>
                      {loc.label}
                    </Text>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{loc.plan}</div>
                  </div>
                </div>

                {/* Effective date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ color: isSelected ? meta.hex : '#d1d5db', fontSize: 12 }} />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#111827' : '#9ca3af' }}>
                    {loc.effectiveDate?.format('MM/DD/YYYY')}
                  </Text>
                </div>

                {/* AFP action tag */}
                <div>
                  {isSelected ? (
                    <Tag
                      icon={<CheckCircleOutlined />}
                      color="blue"
                      style={{ borderRadius: 10, fontSize: 11 }}
                    >
                      Finalize now
                    </Tag>
                  ) : (
                    <Tag
                      icon={<ClockCircleOutlined />}
                      style={{ borderRadius: 10, fontSize: 11, color: '#6b7280', borderColor: '#d1d5db' }}
                    >
                      Keep in renewal
                    </Tag>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Warning when some renewals are left open */}
        {keepingOpen.length > 0 && (
          <Alert
            style={{ marginTop: 12, borderRadius: 8 }}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message={
              <Text>
                <Text strong>{keepingOpen.map((l) => l.label).join(' & ')}</Text>
                {keepingOpen.length === 1 ? ' will remain open until you finalize it' : ' will remain open until you finalize them'}
              </Text>
            }
          />
        )}
      </div>

      {/* ── Section 2: Not in renewal (always carry over, not selectable) ── */}
      {notInRenewal.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
            Not in this renewal — current plans carry over automatically
          </Text>

          <div style={{ border: '1px dashed #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {notInRenewal.map((loc, i) => {
              const meta   = LOC_META[loc.key]
              const isLast = i === notInRenewal.length - 1
              return (
                <div key={loc.key} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 160px 160px',
                  gap: 12, padding: '14px 20px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid #f9f9f9',
                  background: '#fafafa', opacity: 0.75,
                }}>
                  {/* No checkbox — always happens */}
                  <SyncOutlined style={{ color: '#9ca3af', fontSize: 14 }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7, background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#9ca3af', fontSize: 14,
                    }}>
                      {meta.icon}
                    </div>
                    <div>
                      <Text style={{ fontWeight: 600, fontSize: 14, color: '#9ca3af' }}>{loc.label}</Text>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{loc.plan}</div>
                    </div>
                  </div>

                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>—</Text>

                  <Tag
                    icon={<SyncOutlined />}
                    style={{ borderRadius: 10, fontSize: 11, color: '#9ca3af', borderColor: '#e5e7eb' }}
                  >
                    Plans carry over
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
          Complete AFP {finalizing.length > 0 && `for ${finalizing.map((l) => l.label).join(' & ')}`}
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
            <span>Confirm AFP</span>
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
            Confirm & Complete AFP
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>

          {/* Finalizing */}
          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Finalizing
            </Text>
            {finalizing.map((loc) => {
              const meta = LOC_META[loc.key]
              return (
                <div key={loc.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#f0fdf4', borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ color: meta.hex }}>{meta.icon}</span>
                  <Text strong style={{ fontSize: 13 }}>{loc.label}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>Eff. {loc.effectiveDate?.format('MM/DD/YYYY')}</Text>
                  <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11 }}>Finalize</Tag>
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
              {keepingOpen.map((loc) => {
                const meta = LOC_META[loc.key]
                return (
                  <div key={loc.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ color: '#9ca3af' }}>{meta.icon}</span>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>{loc.label}</Text>
                    <Tag icon={<ClockCircleOutlined />} style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11, color: '#6b7280' }}>Remains open</Tag>
                  </div>
                )
              })}
            </div>
          )}

          {/* Carry over */}
          {notInRenewal.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Plans carry over automatically
              </Text>
              {notInRenewal.map((loc) => {
                const meta = LOC_META[loc.key]
                return (
                  <div key={loc.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ color: '#9ca3af' }}>{meta.icon}</span>
                    <Text style={{ fontSize: 13, color: '#9ca3af' }}>{loc.label}</Text>
                    <Tag icon={<SyncOutlined />} style={{ marginLeft: 'auto', borderRadius: 10, fontSize: 11, color: '#9ca3af' }}>Carry over</Tag>
                  </div>
                )
              })}
            </div>
          )}

          {/* Agreement checkbox */}
          <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
            <Text style={{ fontSize: 13 }}>
              I confirm the above and am ready to complete AFP for{' '}
              <Text strong>{finalizing.map((l) => l.label).join(' & ')}</Text>.
            </Text>
          </Checkbox>
        </div>
      </Modal>
    </div>
  )
}
