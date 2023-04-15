import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RollInput, RolllStateType } from 'shared/models/roll';

interface RollInputState {
    data: RollInput;
}

const initialState: RollInputState = {
    data: { student_roll_states: [] },
};

const rollInputSlice = createSlice({
    name: 'rollInput',
    initialState,
    reducers: {
        updateRollState: (state, action: PayloadAction<{ student_id: number; roll_state: RolllStateType }>) => {
            const { student_id, roll_state } = action.payload;
            const index = state.data.student_roll_states.findIndex((s) => s.student_id === student_id);
            if (index !== -1) {
                state.data.student_roll_states[index].roll_state = roll_state;
            }
            else {
                state.data.student_roll_states.push({ student_id: student_id, roll_state: roll_state });
            }
        },
        resetRollInput: (state) => {
            state.data = initialState.data;
        },
    },
});

export const { updateRollState, resetRollInput } = rollInputSlice.actions;

export default rollInputSlice;