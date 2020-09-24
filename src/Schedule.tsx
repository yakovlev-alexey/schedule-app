import React, { useState } from 'react'

import Calendar from 'react-calendar/dist/umd/Calendar'

import 'react-calendar/dist/Calendar.css'

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState()

  return (
    <Calendar
      className="schedule-calendar"
      locale="ru-RU"
      onChange={console.log}
    />
  )
}

export default Schedule
