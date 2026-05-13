import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [healthStatus, setHealthStatus] = useState<{status: string, message: string} | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In Docker-Compose environment (served via Nginx), we will proxy /api to the backend
    fetch('/api/health')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        return res.json()
      })
      .then(data => setHealthStatus(data))
      .catch(err => {
        console.error("Failed to fetch health check:", err);
        setError("Failed to connect to backend. Make sure the backend is running.")
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Aequitas
        </h1>
        <p className="text-lg text-gray-600">
          Ein soziales Netzwerk für Eltern von behinderten Kindern
        </p>

        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Backend Connection Status
          </h2>

          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          ) : healthStatus ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="font-medium">Status: {healthStatus.status}</span>
              </div>
              <p className="text-sm">{healthStatus.message}</p>
            </div>
          ) : (
            <div className="text-gray-500 animate-pulse flex items-center justify-center space-x-2">
               <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting to backend...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
