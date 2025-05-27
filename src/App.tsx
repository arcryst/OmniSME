import { Layout } from './components/layout/Layout'
import { Button } from './components/ui/Button'

function App() {
  return (
    <Layout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to OmniSME</h2>
          <p className="text-gray-600 mb-4">
            Your integrated business management platform for Canadian SMEs.
          </p>
          <Button onClick={() => alert('Dashboard feature coming soon!')}>
            Get Started
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default App