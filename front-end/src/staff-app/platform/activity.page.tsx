import React, { useEffect } from "react"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BorderRadius, Spacing } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { RolllStateType } from "shared/models/roll"
import { toDisplayDate } from "shared/helpers/date-utils"

export const ActivityPage: React.FC = () => {
  const [getActivity, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    void getActivity()
  }, [getActivity])

  const getRollCount = (student_roll_states: { student_id: number; roll_state: RolllStateType }[], type: string) => {
    switch (type) {
      case "all":
        return student_roll_states.length
      case "present":
        return student_roll_states.filter((s) => s.roll_state === "present").length
      case "late":
        return student_roll_states.filter((s) => s.roll_state === "late").length
      case "absent":
        return student_roll_states.filter((s) => s.roll_state === "absent").length
    }
  }

  return (
    <S.Container>
      {loadState === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )}

      {loadState === "loaded" && data?.activity && (
        <S.Table>
          <S.TableHead>
            <tr>
              <S.TableHeader>Name</S.TableHeader>
              <S.TableHeader>Completed At</S.TableHeader>
              <S.TableHeader>No. of Students</S.TableHeader>
              <S.TableHeader>Present</S.TableHeader>
              <S.TableHeader>Late</S.TableHeader>
              <S.TableHeader>Absent</S.TableHeader>
            </tr>
          </S.TableHead>
          <tbody>
            {data?.activity.map((act) => (
              <S.TableRow key={act.entity.id}>
                <S.TableData>{act.entity.name}</S.TableData>
                <S.TableData>{toDisplayDate(act.entity.completed_at)}</S.TableData>
                <S.TableData>{getRollCount(act.entity.student_roll_states, "all")}</S.TableData>
                <S.TableData>{getRollCount(act.entity.student_roll_states, "present")}</S.TableData>
                <S.TableData>{getRollCount(act.entity.student_roll_states, "late")}</S.TableData>
                <S.TableData>{getRollCount(act.entity.student_roll_states, "absent")}</S.TableData>
              </S.TableRow>
            ))}
          </tbody>
        </S.Table>
      )}

      {loadState === "error" && (
        <CenteredContainer>
          <div>Failed to load</div>
        </CenteredContainer>
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  Table: styled.table`
    width: 100%;
    margin: auto;
    border-collapse: separate;
    border-spacing: 0;
    text-align: center;
  `,
  TableHead: styled.thead`
    background-color: ${Colors.blue.base};
    border-radius: ${BorderRadius};
    color: ${Colors.white.base};
  `,
  TableHeader: styled.th`
    padding: 14px;
    border-radius: 25px;
  `,
  TableData: styled.td`
    padding: 14px;
  `,
  TableRow: styled.tr`
    &:nth-of-type(2n) {
      background-color: ${Colors.blue.lighter};
    }
  `,
}
