import React, { useEffect, useState } from 'react'

import { Epic, Tabbar, TabbarItem, View } from '@vkontakte/vkui'
import Icon28CalendarOutline from '@vkontakte/icons/dist/28/calendar_outline'
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline'
import Icon28UsersOutline from '@vkontakte/icons/dist/28/users_outline'

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
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchDays = () => {
    setError(false)
    const formattedDate = formatDate(selectedDate)
    if (days.find(({ date }) => date == formattedDate) == null) {
      setLoading(true)
      API.get(`/${selectedGroup}?date=${formatDate(selectedDate)}`)
        .then((response) => setDays([...days, ...extractDays(response.data)]))
        .catch(() => setError(true))
        .then(() => setLoading(false))
    }
  }

  useEffect(fetchDays, [selectedDate])

  const onStoryChange = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    setActiveView(e.currentTarget.dataset.story)

  return (
    <Epic
      activeStory={activeView}
      tabbar={
        <Tabbar>
          <TabbarItem
            onClick={onStoryChange}
            selected={activeView == 'schedule'}
            data-story="schedule"
            text="Расписание"
          >
            <Icon28CalendarOutline />
          </TabbarItem>
          <TabbarItem
            onClick={onStoryChange}
            selected={activeView == 'groups'}
            data-story="groups"
            text="Группы"
          >
            <Icon28UsersOutline />
          </TabbarItem>
          <TabbarItem
            onClick={onStoryChange}
            selected={activeView == 'settings'}
            data-story="settings"
            text="Настройки"
          >
            <Icon28SettingsOutline />
          </TabbarItem>
        </Tabbar>
      }
    >
      <View id="schedule">
        <Schedule
          loading={loading}
          error={error}
          onRetry={fetchDays}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          days={days}
        />
      </View>
    </Epic>
  )
}

export default App
