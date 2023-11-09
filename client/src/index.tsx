/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route, Routes } from '@solidjs/router'
import './index.css'
import Login from './routes/Login.tsx'
import Signup from './routes/Signup.tsx'
import DentistSignup from './routes/DentistSignup.tsx'
import PatientSignup from './routes/PatientSignup.tsx'

const root = document.getElementById('root')
if (root === null) throw Error('Root undefined!')
render(() => <div>
    <Router>
      <Routes>
        <Route path="/" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dentist-signup" component={DentistSignup} />
        <Route path="/patient-signup" component={PatientSignup} />
      </Routes>
    </Router>

</div>, root)
