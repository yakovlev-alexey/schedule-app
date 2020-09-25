import React, { useEffect, useState } from 'react'

import { PanelHeader, Separator } from '@vkontakte/vkui'
import Calendar from 'react-calendar/dist/umd/Calendar'

import ScheduleView from './ScheduleView'
import { Lesson, Day } from '../types'

import 'react-calendar/dist/Calendar.css'

type ScheduleProps = {
  selectedDate: Date
  setSelectedDate: () => void
}

const Schedule: React.FunctionComponent<ScheduleProps> = (
  props: ScheduleProps
) => {
  const [lsns, setLsns] = useState<Lesson>()
  useEffect(() => {
    import('./lessons.json').then((res) => {
      setLsns(res.default)
    })
  }, [])

  console.log(lsns)

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
      <ScheduleView lessons={lsns} />
    </div>
  )
}

export default Schedule
