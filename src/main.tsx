import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { WorkoutProvider } from './context/WorkoutContext'
import { ProgramProvider } from './context/ProgramContext'
import { BodyProvider } from './context/BodyContext'
import { GoalProvider } from './context/GoalContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProgramProvider>
            <WorkoutProvider>
              <BodyProvider>
                <GoalProvider>
                  <App />
                </GoalProvider>
              </BodyProvider>
            </WorkoutProvider>
          </ProgramProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
