import React, { useEffect, useState } from 'react'
import bridge from '@vkontakte/vk-bridge'

import { Epic, Tabbar, TabbarItem, View, Panel, Alert, ScreenSpinner } from '@vkontakte/vkui'
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
    const day = days?.find(({ weekday }) => weekday == i)
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

const resolveSmartDefaultDay = (sdd: boolean) => (sdd == null ? true : sdd)

const resetWebAppStorage = () => {
  bridge.send('VKWebAppStorageSet', { key: 'theme', value: '' })
  bridge.send('VKWebAppStorageSet', { key: 'smartDefaultDay', value: '' })
  bridge.send('VKWebAppStorageSet', { key: 'savedGroups', value: '' })
  bridge.send('VKWebAppStorageSet', { key: 'selectedGroupId', value: '' })
}

const App: React.FunctionComponent = () => {
  const [activeView, setActiveView] = useState<'schedule' | 'groups' | 'settings'>('schedule')
  const [popout, setPopout] = useState<JSX.Element>(<ScreenSpinner />)
  const [activeGroupsPanel, setActiveGroupsPanel] = useState<'saved' | 'add'>('saved')

  const [selectedGroupId, setSelectedGroupId] = useState<number>(null)

  const [smartDefaultDay, setSmartDefaultDay] = useState<boolean>(true)
  const [selectedDate, setSelectedDate] = useState<Date>(getDefaultDate())

  const [days, setDays] = useState<Day[]>([])

  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [savedGroups, setSavedGroups] = useState<Group[]>(null)
  const [allGroups, setAllGroups] = useState<Group[]>(null)

  const fetchDays = () => {
    if (selectedGroupId == null || selectedDate == null) {
      return
    }
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

  useEffect(() => {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type == 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme')
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light'
        document.body.attributes.setNamedItem(schemeAttribute)
      }
    })
    bridge
      .send('VKWebAppStorageGet', {
        keys: ['theme', 'smartDefaultDay', 'selectedGroupId', 'savedGroups']
      })
      .then(({ keys: [th, sdd, sgi, sg] }) => {
        const parsedSdd = resolveSmartDefaultDay(
          Boolean(JSON.parse(sdd.value.length > 0 ? sdd.value : 'null'))
        )
        setSmartDefaultDay(parsedSdd)
        setSelectedGroupId(JSON.parse(sgi.value.length > 0 ? sgi.value : 'null'))
        setSelectedDate(getDefaultDate(parsedSdd))
        setSavedGroups(JSON.parse(sg.value.length > 0 ? sg.value : 'null'))
        setPopout(null)
      })
  }, [])

  useEffect(fetchDays, [selectedDate])

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

  const onStoryChange = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    setActiveView(e.currentTarget.dataset.story)

  const selectGroup = (group: number, redirect = true) => {
    bridge.send('VKWebAppStorageSet', {
      key: 'selectedGroupId',
      value: JSON.stringify(group)
    })
    setSelectedGroupId(group)

    if (redirect) {
      setActiveView('schedule')
    }

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

    if (savedGroups == null || savedGroups.length == 0) {
      selectGroup(group.id)
    }

    bridge.send('VKWebAppStorageSet', {
      key: 'savedGroups',
      value: JSON.stringify(newSavedGroups)
    })
    setSavedGroups(newSavedGroups)
    setActiveGroupsPanel('saved')
  }

  const removeGroup = (id: number) => {
    const newSavedGroups = savedGroups?.filter((group) => group.id != id)

    if (selectedGroupId == id) {
      selectGroup(newSavedGroups.length > 0 ? newSavedGroups[0].id : null, false)
    }

    bridge.send('VKWebAppStorageSet', {
      key: 'savedGroups',
      value: JSON.stringify(newSavedGroups)
    })
    setSavedGroups(newSavedGroups)
  }

  const changeSmartDefaultDay = (value: boolean) => {
    bridge.send('VKWebAppStorageSet', {
      key: 'smartDefaultDay',
      value: JSON.stringify(value)
    })
    setSmartDefaultDay(value)
  }

  const reset = () => {
    resetWebAppStorage()
    setActiveView('schedule')
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
