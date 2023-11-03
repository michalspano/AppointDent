/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route, Routes } from '@solidjs/router'
import './index.css'

import Home from './routes/Home'

const root = document.getElementById('root')
if (root === null) throw Error('Root undefined!')
render(() => <div>
    <Router>
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </Router>

</div>, root)
