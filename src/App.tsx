import React, { useEffect, useState } from 'react'

import { Root, View } from '@vkontakte/vkui'

import Schedule from './Schedule'
import { Week, Day } from './types'
import { formatDate } from './util'
import API from './API'

import 'bootstrap/dist/css/bootstrap-grid.min.css'
import '@vkontakte/vkui/dist/vkui.css'
import './styles.scss'

const addDays = (date: Date, days: number): Date => {
  date.setDate(date.getDate() + days)
  return date
}

const extractDays = ({ week, days }: Week): Day[] => {
  const extracted = []
  for (let i = 1; i <= 7; ++i) {
    const day = days.find(({ weekday }) => weekday == i)
    extracted.push(
      day != null
        ? day
        : {
            weekday: i,
            date: formatDate(addDays(new Date(week.date_start), i - 1)),
            lessons: []
          }
    )
  }
  return extracted
}

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState('schedule')
  const [selectedGroup, setSelectedGroup] = useState<number>(29868)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const formattedDate = formatDate(selectedDate)
    if (days.find(({ date }) => date == formattedDate) == null) {
      setLoading(true)
      API.get(`/${selectedGroup}?date=${formatDate(selectedDate)}`)
        .then((response) => setDays([...days, ...extractDays(response.data)]))
        .then(() => setLoading(false))
    }
  }, [selectedDate])

  return (
    <Root activeView={activeView}>
      <View id="schedule">
        <Schedule
          loading={loading}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          days={days}
        />
      </View>
    </Root>
  )
}

export default App
