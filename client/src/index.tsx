/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route, Routes } from '@solidjs/router'
import './index.css'

import Home from './routes/Home'
import Navbar from './components/Navbar/Navbar'

const root = document.getElementById('root')
if (root === null) throw Error('Root undefined!')
render(() => <div>
  <Navbar/>
    <Router>
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </Router>

</div>, root)
