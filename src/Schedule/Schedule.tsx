import React, { useMemo } from 'react'

import { PanelHeader, Separator } from '@vkontakte/vkui'
import Calendar from 'react-calendar/dist/umd/Calendar'

import ScheduleView from './ScheduleView'
import { formatDate } from '../util'
import { Day } from '../types'

import 'react-calendar/dist/Calendar.css'

type ScheduleProps = {
  loading: boolean
  error: boolean
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  days: Day[]
}

const Schedule: React.FunctionComponent<ScheduleProps> = (
  props: ScheduleProps
) => {
  const formattedDate = useMemo(() => formatDate(props.selectedDate), [
    props.selectedDate
  ])

  return (
    <div>
      <PanelHeader separator={false}>Расписание</PanelHeader>
      <Separator />
      <Calendar
        className="schedule-calendar"
        locale="ru-RU"
        value={props.selectedDate}
        onChange={props.setSelectedDate}
      />
      <Separator />
      <ScheduleView
        loading={props.loading}
        error={props.error}
        lessons={props.days.find(({ date }) => date == formattedDate)?.lessons}
      />
    </div>
  )
}

export default Schedule
