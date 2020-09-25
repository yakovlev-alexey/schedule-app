import React, { useState, useMemo } from 'react'

import { Card, Header, Separator, UsersStack } from '@vkontakte/vkui'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Lesson } from '../types'

import 'swiper/swiper.scss'

type ScheduleCardProps = {
  lessons: Lesson[]
}

const renderBullets = (length: number, active: number): JSX.Element[] => {
  const bullets: JSX.Element[] = []
  for (let i = 0; i < length; ++i) {
    bullets.push(
      <span
        key={i}
        className={
          active == i
            ? 'lesson-card-bullet lesson-card-bullet--active'
            : 'lesson-card-bullet'
        }
      />
    )
  }
  return bullets
}

const mapLessonsToContents = (lessons: Lesson[]): JSX.Element[] =>
  lessons.map((lesson, index) => (
    <SwiperSlide key={index}>
      <div className="lesson-card-content">
        <div className="row justify-content-between align-items-center lesson-card-header">
          <Header mode="secondary">{lesson.subject}</Header>
          <Header mode="secondary">
            {lesson.time_start} - {lesson.time_end}
          </Header>
        </div>
        <small className="lesson-card-type Cell__description">
          {lesson.typeObj.name}
          {/* {lessons[0].groups.map((group) => group.name)} */}
        </small>
        <div className="lesson-card-body">
          <p className="RichCell__text">
            {lesson.teachers != null && lesson.teachers.length > 0
              ? lesson.teachers.map(({ full_name }) => full_name).join(', ')
              : 'Неизвестный преподаватель'}
          </p>
          <p className="RichCell__text">
            {lesson.auditories.length > 0
              ? lesson.auditories
                  .map(({ name, building }) => `${name}, ${building.name}`)
                  .join(' | ')
              : 'Неизвестная аудитория'}
          </p>
        </div>
      </div>
    </SwiperSlide>
  ))

const ScheduleCard: React.FunctionComponent<ScheduleCardProps> = ({
  lessons
}: ScheduleCardProps) => {
  const [slide, setSlide] = useState<number>(0)

  const contents = useMemo(() => mapLessonsToContents(lessons), [lessons])

  if (lessons.length > 1) {
    return (
      <React.Fragment>
        <Card className="container lesson-card lesson-card-lg">
          <Swiper onSlideChange={({ activeIndex }) => setSlide(activeIndex)}>
            {contents}
          </Swiper>
          <Separator wide />
          <div className="lesson-card-multiple d-flex justify-content-between align-items-center">
            <small>Несколько занятий в это время</small>
            <div>{renderBullets(lessons.length, slide)}</div>
          </div>
        </Card>
      </React.Fragment>
    )
  } else {
    return <Card className="container lesson-card">{contents}</Card>
  }
}

const prepareLessons = (lessons: Lesson[]): Lesson[][] => {
  const list: Lesson[][] = []

  if (lessons == null) {
    return list
  }

  for (let i = 0; i < lessons.length; ++i) {
    const lesson = [lessons[i]]
    for (
      let j = i + 1;
      j < lessons.length && lessons[j].time_start == lessons[i].time_start;
      ++j
    ) {
      lesson.push(lessons[j])
      ++i
    }
    list.push(lesson)
  }

  return list
}

const mapLessonsToCards = (lessons: Lesson[][]): JSX.Element[] =>
  lessons.map((lessons, index) => (
    <ScheduleCard key={index} lessons={lessons} />
  ))

type ScheduleViewProps = {
  lessons: Lesson[]
}

const ScheduleView: React.FunctionComponent<ScheduleViewProps> = (
  props: ScheduleViewProps
) => {
  const lessonCards = useMemo(
    () => mapLessonsToCards(prepareLessons(props.lessons)),
    [props.lessons]
  )

  return <div className="container">{lessonCards}</div>
}

export default ScheduleView
