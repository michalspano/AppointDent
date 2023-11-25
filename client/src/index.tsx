/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route, Routes } from '@solidjs/router'
import './index.css'
import Login from './routes/Login.tsx'
import Signup from './routes/Signup.tsx'
import DentistSignup from './routes/DentistSignup.tsx'
import PatientSignup from './routes/PatientSignup.tsx'
import DentistCalendar from './routes/DentistCalendar.tsx'
import UserProfile from './routes/UserProfile.tsx'
import Map from './routes/Map.tsx'
import Navbar from './components/Navbar/Navbar.tsx'
import MyBookingsPage from './routes/MyBookings.tsx'
import NotificationsPage from './routes/NotificationsPage.tsx'

const root = document.getElementById('root')
if (root === null) throw Error('Root undefined!')

const unLoggedInRoutes = ['/', '/signup', '/dentist-signup', '/patient-signup']

const shouldShowNavbar = (): boolean => {
  const currentPath = window.location.pathname
  return !unLoggedInRoutes.includes(currentPath)
}

render(() => <div>
  {shouldShowNavbar() && <Navbar/>}
    <Router>
      <Routes>
        <Route path="/" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dentist-signup" component={DentistSignup} />
        <Route path="/patient-signup" component={PatientSignup} />
        <Route path="/calendar" component={DentistCalendar} />
        <Route path="/user-profile" component={UserProfile} />
        <Route path="/map" component={Map} />
        <Route path="/my-bookings" component={MyBookingsPage} />
        <Route path="/notifications" component={NotificationsPage}/>
      </Routes>
    </Router>

</div>, root)
