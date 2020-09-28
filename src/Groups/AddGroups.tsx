import React, { useEffect, useMemo, useState } from 'react'

import {
  FixedLayout,
  PanelHeader,
  Search,
  List,
  Placeholder,
  Cell,
  Button,
  PanelSpinner,
  PanelHeaderClose
} from '@vkontakte/vkui'
import Icon56ErrorOutline from '@vkontakte/icons/dist/56/error_outline'
import Icon16Add from '@vkontakte/icons/dist/16/add'

import { Group } from '../types'

type AddGroupsProps = {
  openSaved: () => void
  savedGroups: Group[]
  allGroups: Group[]
  fetchAllGroups: () => void
  saveGroup: (group: Group) => void
}

const AddGroups: React.FunctionComponent<AddGroupsProps> = (
  props: AddGroupsProps
) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')

  const fetchGroups = () => {
    setError(false)
    setLoading(true)
    setSearch('')
    props.fetchAllGroups()
  }

  useEffect(() => {
    if (props.allGroups == null) {
      fetchGroups()
    } else if (props.allGroups.length == 0) {
      setLoading(false)
      setError(true)
    } else {
      setLoading(false)
      setError(false)
    }
  }, [props.allGroups])

  const groups = useMemo(
    () =>
      props.savedGroups == null
        ? props.allGroups
        : props.allGroups?.filter(
            ({ id }) =>
              props.savedGroups.filter((group) => group.id == id).length == 0
          ),
    [props.allGroups, props.savedGroups]
  )

  const renderResults = (): JSX.Element | JSX.Element[] => {
    const results = groups.filter(
      ({ name, spec }) => name.includes(search) || spec.includes(search)
    )
    if (results.length == 0) {
      return <Placeholder>Ничего не найдено</Placeholder>
    } else if (results.length > 10) {
      return (
        <React.Fragment>
          {results.slice(0, 25).map((group) => (
            <Cell
              key={group.id}
              description={group.spec}
              asideContent={
                <Button mode="tertiary" onClick={() => props.saveGroup(group)}>
                  <Icon16Add />
                </Button>
              }
            >
              {group.name}
            </Cell>
          ))}
          <Placeholder>
            Введите более точный запрос, чтобы увидеть больше результатов
          </Placeholder>
        </React.Fragment>
      )
    } else {
      return results.map((group) => (
        <Cell
          key={group.id}
          description={group.spec}
          asideContent={
            <Button mode="tertiary" onClick={() => props.saveGroup(group)}>
              <Icon16Add />
            </Button>
          }
        >
          {group.name}
        </Cell>
      ))
    }
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value)

  const renderContents = (): JSX.Element => {
    if (loading) {
      return <PanelSpinner />
    } else if (error) {
      return (
        <Placeholder
          icon={<Icon56ErrorOutline />}
          action={<Button onClick={fetchGroups}>Повторить попытку</Button>}
        >
          Не удалось загрузить информацию о группах
        </Placeholder>
      )
    } else if (search.length < 5) {
      return (
        <Placeholder>
          {search.length == 0
            ? 'Начните вводить номер группы или название направления'
            : 'Продолжите вводить номер группы или название направления (не менее 5 символов)'}
        </Placeholder>
      )
    } else {
      return <List>{renderResults()}</List>
    }
  }

  return (
    <React.Fragment>
      <PanelHeader
        left={<PanelHeaderClose onClick={props.openSaved}></PanelHeaderClose>}
      >
        Добавить группы
      </PanelHeader>
      <FixedLayout vertical="top">
        <Search value={search} onChange={onSearchChange} after={null} />
      </FixedLayout>
      <div style={{ paddingTop: 60 }}>{renderContents()}</div>
    </React.Fragment>
  )
}

export default AddGroups
