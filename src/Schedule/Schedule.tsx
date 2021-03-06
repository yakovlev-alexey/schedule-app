import React, { useMemo } from 'react'

import { Panel, PanelHeader, Separator } from '@vkontakte/vkui'
import Calendar from 'react-calendar/dist/umd/Calendar'

import ScheduleView from './ScheduleView'
import { formatDate } from '../util'
import { Day } from '../types'

require('react-calendar/dist/Calendar.css') // doesn't compile with import

type ScheduleProps = {
  loading: boolean
  error: boolean
  onRetry: () => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  days: Day[]
  groupSelected: boolean
  onSelectGroup: () => void
}

const Schedule: React.FunctionComponent<ScheduleProps> = (props: ScheduleProps) => {
  const formattedDate = useMemo(() => formatDate(props.selectedDate), [props.selectedDate])

  return (
    <Panel>
      <PanelHeader separator={false}>Расписание</PanelHeader>
      <div className="schedule-calendar-wrapper">
        <Separator />
        <Calendar
          className="schedule-calendar"
          locale="ru-RU"
          value={props.selectedDate}
          onChange={props.setSelectedDate}
        />
        <Separator />
      </div>
      <div className="schedule-view">
        <ScheduleView
          loading={props.loading}
          error={props.error}
          onRetry={props.onRetry}
          lessons={props.days.find(({ date }) => date == formattedDate)?.lessons}
          groupSelected={props.groupSelected}
          onSelectGroup={props.onSelectGroup}
        />
      </div>
    </Panel>
  )
}

export default Schedule
