import React, { useState, useMemo } from 'react'

import { Button, Card, Div, Header, PanelSpinner, Placeholder, Separator } from '@vkontakte/vkui'
import Icon56ErrorOutline from '@vkontakte/icons/dist/56/error_outline'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'

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
          active == i ? 'lesson-card-bullet lesson-card-bullet--active' : 'lesson-card-bullet'
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
          <Header
            aside={
              <React.Fragment>
                {lesson.time_start} - {lesson.time_end} <FontAwesomeIcon icon={faClock} />
              </React.Fragment>
            }
            mode="secondary"
            className="w-50"
          >
            {lesson.subject}
          </Header>
        </div>
        <small className="lesson-card-type Cell__description">{lesson.typeObj.name}</small>
        <div className="lesson-card-body">
          <p className="RichCell__text">
            {lesson.teachers?.length > 0
              ? lesson.teachers.map(({ full_name }) => full_name).join(', ')
              : 'Неизвестный преподаватель'}
          </p>
          <p className="RichCell__text">
            {lesson.auditories?.length > 0
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
      <Div>
        <Card className="container lesson-card lesson-card-lg">
          <Swiper onSlideChange={({ activeIndex }) => setSlide(activeIndex)}>{contents}</Swiper>
          <Separator wide />
          <div className="lesson-card-multiple d-flex justify-content-between align-items-center">
            <small>Несколько занятий в это время</small>
            <div>{renderBullets(lessons.length, slide)}</div>
          </div>
        </Card>
      </Div>
    )
  } else {
    return (
      <Div>
        <Card className="container lesson-card">{contents}</Card>
      </Div>
    )
  }
}

const prepareLessons = (lessons: Lesson[]): Lesson[][] => {
  const list: Lesson[][] = []

  if (lessons == null) {
    return list
  }

  for (let i = 0; i < lessons.length; ++i) {
    const lesson = [lessons[i]]
    for (let j = i + 1; j < lessons.length && lessons[j].time_start == lessons[i].time_start; ++j) {
      lesson.push(lessons[j])
      ++i
    }
    list.push(lesson)
  }

  return list
}

const mapLessonsToCards = (lessons: Lesson[][]): JSX.Element[] =>
  lessons.map((lessons, index) => <ScheduleCard key={index} lessons={lessons} />)

type ScheduleViewProps = {
  loading: boolean
  error: boolean
  onRetry: () => void
  lessons: Lesson[]
  groupSelected: boolean
  onSelectGroup: () => void
}

const ScheduleView: React.FunctionComponent<ScheduleViewProps> = (props: ScheduleViewProps) => {
  const lessonCards = useMemo(() => mapLessonsToCards(prepareLessons(props.lessons)), [
    props.lessons
  ])
  if (!props.groupSelected) {
    return (
      <Placeholder action={<Button onClick={props.onSelectGroup}>Выбрать группу</Button>}>
        Группа не выбрана
      </Placeholder>
    )
  } else if (props.error) {
    return (
      <Placeholder
        icon={<Icon56ErrorOutline />}
        action={<Button onClick={props.onRetry}>Повторить загрузку</Button>}
      >
        Произошла ошибка при загрузке
      </Placeholder>
    )
  } else if (props.loading) {
    return <PanelSpinner />
  } else if (props.lessons?.length == 0) {
    return <Placeholder>Похоже, что в этот день нет занятий</Placeholder>
  }

  return <div>{lessonCards}</div>
}

export default ScheduleView
