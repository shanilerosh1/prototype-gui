import { useState } from 'react'
import { ConfigProvider, Layout } from 'antd'
import LOCSelectionPage from './pages/LOCSelectionPage'
import ConfirmationPage from './pages/ConfirmationPage'
import CarrierOffersPage from './pages/CarrierOffersPage'
import AFPPage from './pages/AFPPage'
import RenewalCyclesDashboard from './pages/RenewalCyclesDashboard'
import EffectiveDatesPage from './pages/EffectiveDatesPage'

const { Header, Content } = Layout

const SCREENS = {
  LOC_SELECTION: 'LOC_SELECTION',
  CONFIRMATION: 'CONFIRMATION',
  CARRIER_OFFERS: 'CARRIER_OFFERS',
  AFP: 'AFP',
  RENEWAL_DASHBOARD: 'RENEWAL_DASHBOARD',
  EFFECTIVE_DATES: 'EFFECTIVE_DATES',
}

export default function App() {
  const [screen, setScreen] = useState(
    window.location.pathname === '/effective-dates'
      ? SCREENS.EFFECTIVE_DATES
      : SCREENS.LOC_SELECTION
  )
  const [renewalConfig, setRenewalConfig] = useState(null)

  const handleNext = (config) => {
    setRenewalConfig(config)
    setScreen(SCREENS.CONFIRMATION)
  }

  const handleStartRenewal = () => {
    setScreen(SCREENS.CARRIER_OFFERS)
  }

  const handleBack = () => {
    setScreen(SCREENS.LOC_SELECTION)
  }

  const handleGoToAFP = () => {
    setScreen(SCREENS.AFP)
  }

  const handleGoToDashboard = () => {
    setScreen(SCREENS.RENEWAL_DASHBOARD)
  }

  const handleGoToEffectiveDates = () => {
    window.history.pushState({}, '', '/effective-dates')
    setScreen(SCREENS.EFFECTIVE_DATES)
  }

  const handleBackFromEffectiveDates = () => {
    window.history.pushState({}, '', '/')
    setScreen(renewalConfig ? SCREENS.CARRIER_OFFERS : SCREENS.LOC_SELECTION)
  }

  const handleAFPComplete = () => {
    setScreen(SCREENS.CARRIER_OFFERS)
  }

  const isWizard = screen === SCREENS.LOC_SELECTION || screen === SCREENS.CONFIRMATION || screen === SCREENS.RENEWAL_DASHBOARD

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a56db',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        {/* Top nav bar */}
        <Header style={{
          background: '#1a2332',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: 12,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            PlanYear
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Renewals</div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 14px', color: 'rgba(255,255,255,0.85)', fontSize: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
            PROTOTYPE
          </div>
        </Header>

        {/* Wizard / dashboard screens (centered layout) */}
        {isWizard && (
          <Content style={{ padding: '48px 24px' }}>
            {screen === SCREENS.LOC_SELECTION && (
              <LOCSelectionPage
                onStartRenewal={handleNext}
                onViewDashboard={handleGoToDashboard}
              />
            )}
            {screen === SCREENS.CONFIRMATION && (
              <ConfirmationPage
                config={renewalConfig}
                onBack={handleBack}
                onStartRenewal={handleStartRenewal}
              />
            )}
            {screen === SCREENS.RENEWAL_DASHBOARD && (
              <RenewalCyclesDashboard
                config={renewalConfig}
                onBack={() => setScreen(SCREENS.LOC_SELECTION)}
                onStartRenewal={() => setScreen(SCREENS.LOC_SELECTION)}
              />
            )}
          </Content>
        )}

        {/* Full carrier offers page (no extra padding — has its own layout) */}
        {screen === SCREENS.CARRIER_OFFERS && (
          <CarrierOffersPage
            config={renewalConfig}
            onCompleteAFP={handleGoToAFP}
            onGoToEffectiveDates={handleGoToEffectiveDates}
          />
        )}

        {/* Effective Dates page */}
        {screen === SCREENS.EFFECTIVE_DATES && (
          <EffectiveDatesPage
            config={renewalConfig}
            onBack={handleBackFromEffectiveDates}
          />
        )}

        {/* AFP page */}
        {screen === SCREENS.AFP && (
          <Content style={{ padding: '48px 24px' }}>
            <AFPPage
              config={renewalConfig}
              onBack={() => setScreen(SCREENS.CARRIER_OFFERS)}
              onComplete={handleAFPComplete}
            />
          </Content>
        )}
      </Layout>
    </ConfigProvider>
  )
}
