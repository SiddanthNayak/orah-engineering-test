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
import { useSelector } from "react-redux"
import { RootState } from "../store/store"
import { useDispatch } from "react-redux"
import { resetRollInput } from "../store/roll-slice"
import { setStudents } from "staff-app/store/student-slice"
interface RollCounts {
  all: number
  present: number
  late: number
  absent: number
}

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [callApi] = useApi({ url: "save-roll" })
  const [filteredStudents, setFilteredStudents] = useState<Person[]>([])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [rollCounts, setRollCounts] = useState<RollCounts>({ all: data?.students.length || 0, present: 0, late: 0, absent: 0 })
  const rollInput = useSelector((state: RootState) => state.reducer.rolls.data)
  const studentList = useSelector((state: RootState) => state.reducer.students.students)
  const dispatch = useDispatch()

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    getRollCount()
  }, [rollInput])

  useEffect(() => {
    if (data) {
      dispatch(setStudents(data?.students))
    }
  }, [data])

  const getRollCount = () => {
    const present = rollInput.student_roll_states.filter((s) => s.roll_state === "present").length || 0
    const late = rollInput.student_roll_states.filter((s) => s.roll_state === "late").length || 0
    const absent = rollInput.student_roll_states.filter((s) => s.roll_state === "absent").length || 0
    setRollCounts({ ...rollCounts, present, late, absent })
  }

  const onSearch = (search?: string) => {
    if (!search) {
      setFilteredStudents(studentList)
      return
    }
    const filtered = studentList.filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      return fullName.includes(search.toLowerCase())
    })
    setFilteredStudents(filtered)
  }

  const onToolbarAction = (action: ToolbarAction, value?: string) => {
    if (action === "roll") {
      const all = data?.students.length || 0
      setRollCounts({ ...rollCounts, all })
      setIsRollMode(true)
    }
    if (action === "sort") {
      const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
      setSortOrder(newSortOrder)
      sortStudents(sortOrder, value)
    }
  }

  const sortStudents = (order: "asc" | "desc", value?: string) => {
    if (value === "firstname") {
      const sorted = [...(studentList || [])].sort((a, b) => {
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
      const sorted = [...(studentList || [])].sort((a, b) => {
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

  const onActiveRollAction = (action: ActiveRollAction, value?: string) => {
    if (action === "exit") {
      dispatch(resetRollInput())
      if (data) {
        dispatch(setStudents(data?.students))
      }
      setFilteredStudents([])
      setIsRollMode(false)
    }
    if (action === "save") {
      setIsRollMode(false)
      callApi(rollInput)
      dispatch(resetRollInput())
      if (data) {
        dispatch(setStudents(data?.students))
      }
      setFilteredStudents([])
    }
    if (action === "filter") {
      if (value === "all") {
        setFilteredStudents(studentList)
      } else {
        const newList = studentList.filter((s) => s.roll_state === value)
        if (newList.length > 0) {
          setFilteredStudents(newList)
        }
      }
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

        {loadState === "loaded" && studentList && (
          <>
            {(filteredStudents.length > 0 ? filteredStudents : studentList).map((s) => (
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
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollCounts={rollCounts} />
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
        <S.Select id="sort" value={sortValue} onChange={(event) => setSortValue(event.target.value)}>
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
