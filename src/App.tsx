import React, { useState } from 'react'

import { Root, View } from '@vkontakte/vkui'

import Schedule from './Schedule'

import 'bootstrap/dist/css/bootstrap-grid.min.css'
import '@vkontakte/vkui/dist/vkui.css'
import './styles.scss'

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState('schedule')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <Root activeView={activeView}>
      <View id="schedule">
        <Schedule
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </View>
    </Root>
  )
}

export default App
