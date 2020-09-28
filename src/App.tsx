import React, { useEffect, useState } from 'react'

import { Epic, Tabbar, TabbarItem, View, Panel } from '@vkontakte/vkui'
import Icon28CalendarOutline from '@vkontakte/icons/dist/28/calendar_outline'
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline'
import Icon28UsersOutline from '@vkontakte/icons/dist/28/users_outline'
import axios from 'axios'

import Schedule from './Schedule'
import { Week, Day, Group, Faculty } from './types'
import { AddGroups, SavedGroups } from './Groups'
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

const getDefaultDate = (): Date => {
  const today = new Date()
  return today.getDay() == 0 || today.getHours() > 20
    ? addDays(today, 1)
    : today
}

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState('schedule')
  const [activeGroupsPanel, setActiveGroupsPanel] = useState<string>('saved')

  const [selectedGroupId, setSelectedGroupId] = useState<number>(
    JSON.parse(localStorage.getItem('selectedGroupId'))
  )
  const [selectedDate, setSelectedDate] = useState<Date>(getDefaultDate())

  const [days, setDays] = useState<Day[]>([])

  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [savedGroups, setSavedGroups] = useState<Group[]>(
    JSON.parse(localStorage.getItem('savedGroups'))
  )
  const [allGroups, setAllGroups] = useState<Group[]>(null)

  const fetchDays = () => {
    setError(false)
    const formattedDate = formatDate(selectedDate)
    if (days.find(({ date }) => date == formattedDate) == null) {
      setLoading(true)
      API.get(`/${selectedGroupId}?date=${formatDate(selectedDate)}`)
        .then((response) => setDays([...days, ...extractDays(response.data)]))
        .catch(() => setError(true))
        .then(() => setLoading(false))
    }
  }

  const fetchAllGroups = () => {
    axios
      .get('https://ruz.spbstu.ru/api/v1/ruz/faculties')
      .then((response) => response.data.faculties)
      .then((faculties: Faculty[]) =>
        faculties.map(({ id }) =>
          axios
            .get(`https://ruz.spbstu.ru/api/v1/ruz/faculties/${id}/groups`)
            .then((response) => response.data.groups)
        )
      )
      .then((promises: Promise<Group[]>[]) => Promise.all(promises))
      .then((groups: Group[][]) => [].concat(...groups))
      .then((groups: Group[]) => setAllGroups(groups))
      .catch(() => setAllGroups([]))
  }

  useEffect(fetchDays, [selectedDate])

  const onStoryChange = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    setActiveView(e.currentTarget.dataset.story)

  const selectGroup = (group: number, redirect = true) => {
    localStorage.setItem('selectedGroupId', JSON.stringify(group))
    if (redirect) {
      setActiveView('schedule')
    }
    setSelectedGroupId(group)
    setError(false)
    setLoading(true)
    API.get(`/${group}?date=${formatDate(selectedDate)}`)
      .then((response) => setDays([...extractDays(response.data)]))
      .catch(() => {
        setDays([])
        setError(true)
      })
      .then(() => setLoading(false))
  }

  const saveGroup = (group: Group) => {
    const newSavedGroups =
      savedGroups == null ? [group] : [...savedGroups, group]
    localStorage.setItem('savedGroups', JSON.stringify(newSavedGroups))
    if (savedGroups == null || savedGroups.length == 0) {
      selectGroup(group.id)
    }
    setSavedGroups(newSavedGroups)
    setActiveGroupsPanel('saved')
  }

  const removeGroup = (id: number) => {
    const newSavedGroups = savedGroups?.filter((group) => group.id != id)
    localStorage.setItem('savedGroups', JSON.stringify(newSavedGroups))
    if (selectedGroupId == id) {
      selectGroup(
        newSavedGroups.length > 0 ? newSavedGroups[0].id : null,
        false
      )
    }
    console.log(newSavedGroups, savedGroups, id)
    setSavedGroups(newSavedGroups)
  }

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
          groupSelected={selectedGroupId != null}
          onSelectGroup={() => setActiveView('groups')}
        />
      </View>
      <View id="groups" activePanel={activeGroupsPanel}>
        <Panel id="saved">
          <SavedGroups
            savedGroups={savedGroups}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={selectGroup}
            openAddGroups={() => setActiveGroupsPanel('add')}
            removeSavedGroup={removeGroup}
          />
        </Panel>
        <Panel id="add">
          <AddGroups
            openSaved={() => setActiveGroupsPanel('saved')}
            allGroups={allGroups}
            savedGroups={savedGroups}
            saveGroup={saveGroup}
            fetchAllGroups={fetchAllGroups}
          />
        </Panel>
      </View>
    </Epic>
  )
}

export default App
