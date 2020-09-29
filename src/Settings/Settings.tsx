import React, { useState } from 'react'

import {
  CellButton,
  Group,
  Header,
  Link,
  PanelHeader,
  SimpleCell,
  Switch
} from '@vkontakte/vkui'

type SettingsProps = {
  smartDefaultDay: boolean
  onSmartDefaultDayChange: (value: boolean) => void
  onResetClick: () => void
}

const Settings: React.FunctionComponent<SettingsProps> = (
  props: SettingsProps
) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  return (
    <React.Fragment>
      <PanelHeader>Настройки</PanelHeader>
      <Group header={<Header mode="secondary">Поведение</Header>}>
        <SimpleCell
          disabled
          after={
            <Switch
              checked={props.smartDefaultDay}
              onChange={(e) => props.onSmartDefaultDayChange(e.target.checked)}
            />
          }
          onClick={() => setShowTooltip(!showTooltip)}
          description={
            showTooltip ? 'Выбор следующего дня вечером текущего' : null
          }
        >
          Умное определение дня
        </SimpleCell>
      </Group>
      <Group header={<Header mode="secondary">Информация о приложении</Header>}>
        <Link
          href="https://github.com/yakovlev-alexey/schedule-app"
          target="_blank"
        >
          <CellButton>Репозиторий GitHub</CellButton>
        </Link>
        <Link href="https://t.me/alexeyjakovlev" target="_blank">
          <CellButton>Связаться с разработчиком</CellButton>
        </Link>
      </Group>
      <Group header={<Header mode="secondary">Сброс</Header>}>
        <CellButton mode="danger" onClick={props.onResetClick}>
          Восстановить настройки
        </CellButton>
      </Group>
    </React.Fragment>
  )
}

export default Settings
