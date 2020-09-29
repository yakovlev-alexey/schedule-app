import React, { useMemo } from 'react'

import {
  Button,
  Cell,
  Div,
  Group as ItemGroup,
  Header,
  List,
  PanelHeader,
  Placeholder,
  usePlatform,
  ANDROID,
  IOS
} from '@vkontakte/vkui'
import Icon16Add from '@vkontakte/icons/dist/16/add'
import Icon16Cancel from '@vkontakte/icons/dist/24/cancel'

import { Group } from '../types'

type SavedGroupsProps = {
  savedGroups: Group[]
  selectedGroupId: number
  setSelectedGroupId: (group: number) => void
  removeSavedGroup: (id: number) => void
  openAddGroups: () => void
}

const SavedGroups: React.FunctionComponent<SavedGroupsProps> = (props: SavedGroupsProps) => {
  const platform = usePlatform()

  const mapGroupsToCells = (): JSX.Element[] =>
    props.savedGroups?.map((group) => (
      <Cell
        key={group.id}
        selectable
        description={group.spec}
        checked={group.id == props.selectedGroupId}
        onChange={() => props.setSelectedGroupId(group.id)}
        asideContent={
          platform == IOS && (
            <Button
              mode="tertiary"
              onClick={() => props.removeSavedGroup(group.id)}
              style={{ paddingRight: 0 }}
            >
              <Icon16Cancel />
            </Button>
          )
        }
        before={
          platform == ANDROID && (
            <Button
              mode="tertiary"
              onClick={() => props.removeSavedGroup(group.id)}
              style={{ paddingLeft: 0 }}
            >
              <Icon16Cancel />
            </Button>
          )
        }
      >
        {group.name}
      </Cell>
    ))

  const groupCells = useMemo(mapGroupsToCells, [props.savedGroups, props.selectedGroupId])

  return (
    <React.Fragment>
      <PanelHeader>Группы</PanelHeader>
      <ItemGroup header={<Header mode="secondary">Сохраненные группы</Header>}>
        <List>{groupCells != null ? groupCells : <Placeholder>Список пуст</Placeholder>}</List>
      </ItemGroup>
      <Div>
        <Button
          size="l"
          stretched
          mode="secondary"
          before={<Icon16Add />}
          onClick={props.openAddGroups}
        >
          Добавить
        </Button>
      </Div>
    </React.Fragment>
  )
}

export default SavedGroups
