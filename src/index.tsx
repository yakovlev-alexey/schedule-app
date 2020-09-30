import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

import bridge from '@vkontakte/vk-bridge'

bridge.send('VKWebAppInit', {})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
