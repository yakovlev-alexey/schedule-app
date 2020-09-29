import React, { useEffect, useState } from 'react'

import { Epic, Tabbar, TabbarItem, View, Panel, Alert } from '@vkontakte/vkui'
import Icon28CalendarOutline from '@vkontakte/icons/dist/28/calendar_outline'
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline'
import Icon28UsersOutline from '@vkontakte/icons/dist/28/users_outline'

import Schedule from './Schedule'
import { AddGroups, SavedGroups } from './Groups'
import Settings from './Settings'

import { Week, Day, Group, Faculty } from './types'
import { formatDate, addDays } from './util'
import API from './API'

import 'bootstrap/dist/css/bootstrap-grid.min.css'
import '@vkontakte/vkui/dist/vkui.css'
import './styles.scss'

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

const getDefaultDate = (smartDefaultDay = true): Date => {
  const today = new Date()
  if (!smartDefaultDay) {
    return today
  } else if (today.getDay() == 6 && today.getHours() > 20) {
    return addDays(today, 2)
  } else if (today.getDay() == 0 || today.getHours() > 20) {
    return addDays(today, 1)
  } else {
    return today
  }
}

const resolveSmartDefaultDay = () => {
  const sdd = JSON.parse(localStorage.getItem('smartDefaultDay'))
  return sdd == null ? true : sdd
}

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState<'schedule' | 'groups' | 'settings'>('schedule')
  const [popout, setPopout] = useState<JSX.Element>(null)
  const [activeGroupsPanel, setActiveGroupsPanel] = useState<'saved' | 'add'>('saved')

  const [selectedGroupId, setSelectedGroupId] = useState<number>(
    JSON.parse(localStorage.getItem('selectedGroupId'))
  )
  const [smartDefaultDay, setSmartDefaultDay] = useState<boolean>(resolveSmartDefaultDay())
  const [selectedDate, setSelectedDate] = useState<Date>(getDefaultDate(smartDefaultDay))

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
      API.get(`/scheduler/${selectedGroupId}?date=${formatDate(selectedDate)}`)
        .then((response) => setDays([...days, ...extractDays(response.data)]))
        .catch(() => setError(true))
        .then(() => setLoading(false))
    }
  }

  const fetchAllGroups = () => {
    API.get('/faculties')
      .then((response) => response.data.faculties)
      .then((faculties: Faculty[]) =>
        faculties.map(({ id }) =>
          API.get(`/faculties/${id}/groups`).then((response) => response.data.groups)
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
    const newSavedGroups = savedGroups == null ? [group] : [...savedGroups, group]
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
      selectGroup(newSavedGroups.length > 0 ? newSavedGroups[0].id : null, false)
    }
    setSavedGroups(newSavedGroups)
  }

  const changeSmartDefaultDay = (value: boolean) => {
    setSmartDefaultDay(value)
    localStorage.setItem('smartDefaultDay', JSON.stringify(value))
  }

  const reset = () => {
    localStorage.clear()
    setActiveView('groups')
    setActiveGroupsPanel('saved')
    setDays([])
    setSelectedDate(getDefaultDate())
    setSavedGroups(null)
    setAllGroups(null)
    setSmartDefaultDay(true)
    setSelectedGroupId(null)
  }

  const onResetClick = () => {
    setPopout(
      <Alert
        actionsLayout="vertical"
        actions={[
          { title: 'Отмена', autoclose: true, mode: 'cancel' },
          {
            title: 'Восстановить',
            autoclose: true,
            mode: 'destructive',
            action: () => reset()
          }
        ]}
        onClose={() => setPopout(null)}
      >
        Восстановление настроек приведет к удалению всех настроек и сохраненных групп.
      </Alert>
    )
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
      <View popout={popout} id="settings">
        <Settings
          smartDefaultDay={smartDefaultDay}
          onSmartDefaultDayChange={changeSmartDefaultDay}
          onResetClick={onResetClick}
        />
      </View>
    </Epic>
  )
}

export default App
