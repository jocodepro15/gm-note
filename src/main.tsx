import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { WorkoutProvider } from './context/WorkoutContext'
import { ProgramProvider } from './context/ProgramContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProgramProvider>
        <WorkoutProvider>
          <App />
        </WorkoutProvider>
      </ProgramProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
