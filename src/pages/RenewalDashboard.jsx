import { useState } from 'react'
import {
  Card,
  Typography,
  Tag,
  Button,
  Table,
  Alert,
  Tooltip,
  message,
  Badge,
  Modal,
  Space,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  StopOutlined,
  SyncOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  SmileOutlined,
  EyeOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const LOC_ICONS = {
  MEDICAL: <MedicineBoxOutlined />,
  DENTAL: <SmileOutlined />,
  VISION: <EyeOutlined />,
}

const LOC_COLORS = {
  MEDICAL: { hex: '#1a56db', bg: '#eff6ff' },
  DENTAL: { hex: '#0e9f6e', bg: '#f0fdf4' },
  VISION: { hex: '#7e3af2', bg: '#faf5ff' },
}

export default function RenewalDashboard({ config, onBack }) {
  const [offerModal, setOfferModal] = useState(null)

  const selected = config.filter((l) => l.selected)
  const carried = config.filter((l) => !l.selected)

  const handleAddOffer = (loc) => {
    if (!loc.selected) return
    setOfferModal(loc)
  }

  const columns = [
    {
      title: 'Line of Coverage',
      key: 'loc',
      width: '30%',
      render: (_, row) => {
        const color = LOC_COLORS[row.key]
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: row.selected ? color.bg : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: row.selected ? color.hex : '#bfbfbf',
                fontSize: 15,
              }}
            >
              {LOC_ICONS[row.key]}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1a2332', lineHeight: 1.3 }}>
                {row.label}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.plan}
              </Text>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Renewal Status',
      key: 'status',
      width: '22%',
      render: (_, row) =>
        row.selected ? (
          <Badge
            status="processing"
            text={
              <Text style={{ color: '#1a56db', fontWeight: 500 }}>
                In Renewal
              </Text>
            }
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SyncOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Carrying Forward
            </Text>
          </div>
        ),
    },
    {
      title: 'Effective Date',
      key: 'date',
      width: '18%',
      render: (_, row) =>
        row.selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined style={{ color: '#1a56db', fontSize: 13 }} />
            <Text strong style={{ color: '#1a2332' }}>
              {row.effectiveDate?.format('MM/DD/YYYY')}
            </Text>
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Auto-set at finalization
          </Text>
        ),
    },
    {
      title: 'Offers',
      key: 'offers',
      width: '15%',
      render: (_, row) =>
        row.selected ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            0 offers
          </Text>
        ) : (
          <Tag
            icon={<SyncOutlined />}
            color="default"
            style={{ fontSize: 11, borderRadius: 4 }}
          >
            Auto-copied at finalization
          </Tag>
        ),
    },
    {
      title: '',
      key: 'action',
      width: '15%',
      render: (_, row) =>
        row.selected ? (
          <Button
            type="primary"
            ghost
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddOffer(row)}
            style={{ borderColor: LOC_COLORS[row.key].hex, color: LOC_COLORS[row.key].hex }}
          >
            Add Offer
          </Button>
        ) : (
          <Tooltip title={`${row.label} is not part of this renewal. Its current plan will carry forward automatically. Start a new renewal cycle to renew this LOC.`}>
            <Button
              size="small"
              disabled
              icon={<StopOutlined />}
            >
              Add Offer
            </Button>
          </Tooltip>
        ),
    },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ padding: 0, color: '#6b7280', fontSize: 13 }}
        >
          Back to Renewal Setup
        </Button>
      </div>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Renewal In Progress
          </Title>
          <Text type="secondary">
            Apex Solutions Inc &nbsp;·&nbsp; Current Plan Year: Jan 1, 2026 – Dec 31, 2026
          </Text>
        </div>
        <Tag color="processing" style={{ borderRadius: 12, padding: '2px 12px', fontSize: 12 }}>
          In Progress
        </Tag>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card
          size="small"
          style={{ borderRadius: 8, borderLeft: '3px solid #1a56db' }}
          bodyStyle={{ padding: '14px 16px' }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            LOCs In Renewal
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Title level={2} style={{ margin: 0, color: '#1a56db', lineHeight: 1 }}>
              {selected.length}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selected.map((l) => l.label).join(', ')}
            </Text>
          </div>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 8, borderLeft: '3px solid #8c8c8c' }}
          bodyStyle={{ padding: '14px 16px' }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Carrying Forward
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Title level={2} style={{ margin: 0, color: '#8c8c8c', lineHeight: 1 }}>
              {carried.length}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {carried.length > 0 ? carried.map((l) => l.label).join(', ') : 'None'}
            </Text>
          </div>
        </Card>

        <Card
          size="small"
          style={{ borderRadius: 8, borderLeft: '3px solid #f59e0b' }}
          bodyStyle={{ padding: '14px 16px' }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Offers Created
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Title level={2} style={{ margin: 0, color: '#f59e0b', lineHeight: 1 }}>
              0
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              across all LOCs
            </Text>
          </div>
        </Card>
      </div>

      {/* Carry-forward info banner */}
      {carried.length > 0 && (
        <Alert
          style={{ marginBottom: 24, borderRadius: 8 }}
          type="info"
          showIcon
          message={
            <Text strong>
              {carried.map((l) => l.label).join(' & ')}{' '}
              {carried.length === 1 ? 'is' : 'are'} not part of this renewal cycle
            </Text>
          }
          description={
            `${carried.length === 1 ? 'Its' : 'Their'} current plan year plans will be automatically copied to the new plan year when the renewal is finalized. ` +
            `You can include ${carried.length === 1 ? 'it' : 'them'} in a future renewal cycle.`
          }
        />
      )}

      {/* LOC table */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Lines of Coverage</span>
            <Tag style={{ fontWeight: 400, borderRadius: 10 }}>{config.length} total</Tag>
          </div>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          dataSource={config}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="middle"
          rowClassName={(row) => (row.selected ? '' : 'carried-row')}
        />
      </Card>

      {/* Add Offer modal (simulated) */}
      <Modal
        open={!!offerModal}
        title={
          offerModal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: offerModal ? LOC_COLORS[offerModal.key].bg : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: offerModal ? LOC_COLORS[offerModal.key].hex : '#999',
                  fontSize: 13,
                }}
              >
                {offerModal && LOC_ICONS[offerModal.key]}
              </div>
              Add {offerModal?.label} Offer
            </div>
          )
        }
        onCancel={() => setOfferModal(null)}
        footer={[
          <Button key="cancel" onClick={() => setOfferModal(null)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              message.success(`${offerModal?.label} offer wizard would open here.`)
              setOfferModal(null)
            }}
          >
            Continue to Offer Wizard
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 6 }}
            message={`Creating a ${offerModal?.label} renewal offer`}
            description={`Effective date: ${offerModal?.effectiveDate?.format('MM/DD/YYYY')}. This offer will be for the upcoming renewal period.`}
          />
          <Text type="secondary" style={{ fontSize: 13 }}>
            In the real flow, this would open the Add Offer wizard for{' '}
            <Text strong>{offerModal?.label}</Text> with carrier selection, plan
            upload, and rate entry steps.
          </Text>
        </div>
      </Modal>

      <style>{`
        .carried-row td {
          background: #fafafa !important;
          opacity: 0.75;
        }
      `}</style>
    </div>
  )
}
