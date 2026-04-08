import { useState } from 'react'
import { ConfigProvider, Layout } from 'antd'
import LOCSelectionPage from './pages/LOCSelectionPage'
import CensusUploadPage from './pages/CensusUploadPage'
import ConfirmationPage from './pages/ConfirmationPage'
import CarrierOffersPage from './pages/CarrierOffersPage'
import AFPPage from './pages/AFPPage'
import RenewalCyclesDashboard from './pages/RenewalCyclesDashboard'
import EffectiveDatesPage from './pages/EffectiveDatesPage'

const { Header, Content } = Layout

const SCREENS = {
  LOC_SELECTION:     'LOC_SELECTION',
  CENSUS_UPLOAD:     'CENSUS_UPLOAD',
  CONFIRMATION:      'CONFIRMATION',
  CARRIER_OFFERS:    'CARRIER_OFFERS',
  AFP:               'AFP',
  RENEWAL_DASHBOARD: 'RENEWAL_DASHBOARD',
  EFFECTIVE_DATES:   'EFFECTIVE_DATES',
}

export default function App() {
  const [screen, setScreen] = useState(
    window.location.pathname === '/effective-dates'
      ? SCREENS.EFFECTIVE_DATES
      : SCREENS.CARRIER_OFFERS
  )
  const [renewalConfig, setRenewalConfig] = useState(null)
  const [preSelectedLocKey, setPreSelectedLocKey] = useState(null)
  const [smallGroupMap, setSmallGroupMap] = useState({})

  // Step 1 → Step 1.5 or Step 2: carry config from LOC selection
  const handleConfigNext = (config, sgMap) => {
    setRenewalConfig(config)
    setSmallGroupMap(sgMap || {})
    // If any carrier is flagged small group, go to census upload step
    const hasSmallGroup = Object.values(sgMap || {}).some((v) => v === 'yes')
    setScreen(hasSmallGroup ? SCREENS.CENSUS_UPLOAD : SCREENS.CONFIRMATION)
  }

  // Step 2 confirmed → land directly on Carrier Offers
  const handleStartRenewal = () => {
    setScreen(SCREENS.CARRIER_OFFERS)
  }

  // Manage Cycles → Carrier Offers (for an in-renewal LOC)
  const handleGoToCarrierOffers = () => {
    setScreen(SCREENS.CARRIER_OFFERS)
  }

  // Carrier Offers or anywhere → Manage Cycles hub
  const handleGoToRenewalCycles = () => {
    setScreen(SCREENS.RENEWAL_DASHBOARD)
  }

  const handleGoToAFP = () => {
    setScreen(SCREENS.AFP)
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

  const isWizard = screen === SCREENS.LOC_SELECTION || screen === SCREENS.CENSUS_UPLOAD || screen === SCREENS.CONFIRMATION || screen === SCREENS.RENEWAL_DASHBOARD

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

        {/* Wizard / dashboard screens */}
        {isWizard && (
          <Content style={{ padding: '48px 24px' }}>
            {screen === SCREENS.LOC_SELECTION && (
              <LOCSelectionPage
                onStartRenewal={handleConfigNext}
                onViewDashboard={handleGoToRenewalCycles}
                lockedConfig={renewalConfig}
                onCancel={renewalConfig ? handleGoToRenewalCycles : null}
                preSelectedLocKey={preSelectedLocKey}
              />
            )}
            {screen === SCREENS.CENSUS_UPLOAD && (
              <CensusUploadPage
                config={renewalConfig}
                smallGroupMap={smallGroupMap}
                onNext={() => setScreen(SCREENS.CONFIRMATION)}
                onBack={() => setScreen(SCREENS.LOC_SELECTION)}
                onSaveProgress={() => alert('Progress saved! You can close and resume later.')}
              />
            )}
            {screen === SCREENS.CONFIRMATION && (
              <ConfirmationPage
                config={renewalConfig}
                hasCensusStep={Object.values(smallGroupMap).some((v) => v === 'yes')}
                onBack={() => {
                  const hasSmallGroup = Object.values(smallGroupMap).some((v) => v === 'yes')
                  setScreen(hasSmallGroup ? SCREENS.CENSUS_UPLOAD : SCREENS.LOC_SELECTION)
                }}
                onStartRenewal={handleStartRenewal}
              />
            )}
            {screen === SCREENS.RENEWAL_DASHBOARD && (
              <RenewalCyclesDashboard
                config={renewalConfig}
                onStartRenewal={(locKey) => { setPreSelectedLocKey(locKey ?? null); setScreen(SCREENS.LOC_SELECTION) }}
                onViewCarrierOffers={handleGoToCarrierOffers}
              />
            )}
          </Content>
        )}

        {/* Full carrier offers page */}
        {screen === SCREENS.CARRIER_OFFERS && (
          <CarrierOffersPage
            config={renewalConfig}
            onCompleteAFP={handleGoToAFP}
            onGoToEffectiveDates={handleGoToEffectiveDates}
            onGoToRenewalCycles={handleGoToRenewalCycles}
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
