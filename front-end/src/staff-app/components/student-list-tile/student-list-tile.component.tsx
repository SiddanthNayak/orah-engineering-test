import React from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Images } from "assets/images"
import { Colors } from "shared/styles/colors"
import { Person, PersonHelper } from "shared/models/person"
import { RollStateSwitcher } from "staff-app/components/roll-state/roll-state-switcher.component"
import { RollInput, RolllStateType } from "shared/models/roll"

interface Props {
  isRollMode?: boolean
  student: Person
  rollInput: RollInput
  onRollStateChange?: (rollInput: RollInput) => void
}

export const StudentListTile: React.FC<Props> = ({ isRollMode, student, rollInput, onRollStateChange }) => {
  const handleStateChange = (newState: RolllStateType) => {
    const index = rollInput.student_roll_states.findIndex((s) => s.student_id === student.id)

    if (index !== undefined && index >= 0) {
      rollInput.student_roll_states[index].roll_state = newState
    } else {
      rollInput.student_roll_states.push({ student_id: student.id, roll_state: newState })
    }

    if (onRollStateChange) {
      onRollStateChange(rollInput)
    }
  }

  return (
    <S.Container>
      <S.Avatar url={Images.avatar}></S.Avatar>
      <S.Content>
        <div>{PersonHelper.getFullName(student)}</div>
      </S.Content>
      {isRollMode && (
        <S.Roll>
          <RollStateSwitcher onStateChange={(newState) => handleStateChange(newState)} />
        </S.Roll>
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    height: 60px;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;

    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Avatar: styled.div<{ url: string }>`
    width: 60px;
    background-image: url(${({ url }) => url});
    border-top-left-radius: ${BorderRadius.default};
    border-bottom-left-radius: ${BorderRadius.default};
    background-size: cover;
    background-position: 50%;
    align-self: stretch;
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
  `,
  Roll: styled.div`
    display: flex;
    align-items: center;
    margin-right: ${Spacing.u4};
  `,
}
