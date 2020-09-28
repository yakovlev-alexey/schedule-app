export type Faculty = {
  id: number
  name: string
  abbr: string
}

export type Group = {
  id: number
  name: string
  level: number
  type: string
  kind: number
  spec: string
  year: number
  faculty?: Faculty
}

export type Teacher = {
  id: number
  oid: number
  full_name: string
  first_name: string
  middle_name: string
  last_name: string
  grade: string
  chair: string
}

export type Building = {
  id: number
  name: string
  abbr: string
  address: string
}

export type Auditory = {
  id: number
  name: string
  building: Building
}

export type LessonType = {
  id: number
  name: string
  abbr: string
}

export type Lesson = {
  subject: string
  subject_short: string
  type: number
  additional_info: string
  time_start: string
  time_end: string
  parity: number
  typeObj: LessonType
  groups: Group[]
  teachers: Teacher[]
  auditories: Auditory[]
  webinar_url: string
  lms_url: string
}

export type Day = {
  weekday: number
  date: string
  lessons: Lesson[]
}

export type WeekType = {
  date_start: string
  date_end: string
  is_odd: boolean
}

export type Week = {
  week: WeekType
  days: Day[]
}
