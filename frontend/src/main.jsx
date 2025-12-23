import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import App from './App.jsx'
import { store } from './store/store.js'
import './index.css'

// Load Stripe - Replace with your actual publishable key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <App />
          <Toaster position="top-right" />
        </Elements>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
