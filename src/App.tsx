import React, { useState } from 'react'

import { Root, View } from '@vkontakte/vkui'

import Schedule from './Schedule'

import '@vkontakte/vkui/dist/vkui.css'
import './styles.scss'

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState('schedule')

  return (
    <Root activeView={activeView}>
      <View id="schedule">
        <Schedule />
      </View>
    </Root>
  )
}

export default App
