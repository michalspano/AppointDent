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
import MyBookingsPage from './routes/MyBookings.tsx'
import RouteGuard from './components/RouteGuard.tsx'

const root = document.getElementById('root')
if (root === null) throw Error('Root undefined!')

render(() => <div>
    <Router>
      <Routes>
        <Route path="/" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dentist-signup" component={DentistSignup} />
        <Route path="/patient-signup" component={PatientSignup} />
        <Route path="/" component={RouteGuard}>
          <Route path="/calendar" component={DentistCalendar} />
          <Route path="/user-profile" component={UserProfile} />
          <Route path="/map" component={Map} />
          <Route path="/my-bookings" component={MyBookingsPage} />
        </Route>
      </Routes>
    </Router>
</div>, root)
