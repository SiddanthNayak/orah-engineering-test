import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [filteredStudents, setFilteredStudents] = useState<Person[]>([])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onSearch = (search?: string) => {
    console.log(search)
    if (!search) {
      setFilteredStudents(data?.students || [])
      return
    }
    const filtered = (data?.students || []).filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      console.log(fullName.includes(search.toLowerCase()))
      return fullName.includes(search.toLowerCase())
    })
    console.log(filtered)
    setFilteredStudents(filtered)
  }

  const onToolbarAction = (action: ToolbarAction, value?: string) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "sort") {
      const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
      setSortOrder(newSortOrder)
      sortStudents(sortOrder, value)
    }
  }

  const sortStudents = (order: "asc" | "desc", value?: string) => {
    console.log(order)
    if (value === "firstname") {
      const sorted = [...(data?.students || [])].sort((a, b) => {
        const nameA = a.first_name.toUpperCase()
        const nameB = b.first_name.toUpperCase()
        if (nameA < nameB) {
          return order === "asc" ? -1 : 1
        }
        if (nameA > nameB) {
          return order === "asc" ? 1 : -1
        }
        return 0
      })
      setFilteredStudents(sorted)
    } else {
      const sorted = [...(data?.students || [])].sort((a, b) => {
        const nameA = a.last_name.toUpperCase()
        const nameB = b.last_name.toUpperCase()
        if (nameA < nameB) {
          return order === "asc" ? -1 : 1
        }
        if (nameA > nameB) {
          return order === "asc" ? 1 : -1
        }
        return 0
      })
      setFilteredStudents(sorted)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} sortOrder={sortOrder} onSearch={onSearch} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {(filteredStudents.length > 0 ? filteredStudents : data?.students).map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  onSearch: (search?: string) => void
  sortOrder: string
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, sortOrder, onSearch } = props
  const [sortValue, setSortValue] = useState<string>("firstname")

  return (
    <S.ToolbarContainer>
      <S.SortContainer>
        <S.Select id="sort" value={sortValue} onChange={(event) => setSortValue(event.target.value as string)}>
          <S.Option value="firstname">First Name</S.Option>
          <S.Option value="lastname">Last Name</S.Option>
        </S.Select>
        <S.Button onClick={() => onItemClick("sort", sortValue)}>{sortOrder === "asc" ? "↓" : "↑"}</S.Button>
      </S.SortContainer>
      <S.Search onChange={(event) => onSearch(event.target.value)} type="text" placeholder="Search" name="search" />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SortContainer: styled.div`
    display: flex;
    justify-content: space-betwen;
    align-items: center;
  `,
  Select: styled.select`
    border: none;
    background: transparent;
    color: ${Colors.white.base};
  `,
  Option: styled.option`
    color: ${Colors.dark.base};
  `,
  Search: styled.input`
    background: transparent;
    border: none;
    border-bottom: 1px solid black;
    color: ${Colors.white.base};
    outline: none;
  `,
}
