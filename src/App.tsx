import React, { useState } from 'react'

import { Root, View } from '@vkontakte/vkui'

import './styles.scss'

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState('schedule')

  return (
    <Root activeView={activeView}>
      <View id="schedule" />
    </Root>
  )
}

export default App
