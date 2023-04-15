import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Person } from 'shared/models/person';
import { RolllStateType } from 'shared/models/roll';

interface StudentList {
    students: Person[];
}

const initialState: StudentList = {
    students: [],
};

const studentSlice = createSlice({
    name: 'studentList',
    initialState,
    reducers: {
        setStudents: (state, action: PayloadAction<Person[]>) => {
            state.students = action.payload
        },
        updateStudentRoll: (state, action: PayloadAction<{ student_id: number, roll_state: RolllStateType }>) => {
            const { student_id, roll_state } = action.payload;
            const index = state.students.findIndex((s) => s.id === student_id)
            if (index !== -1) {
                state.students[index].roll_state = roll_state;
            }
        }
    },
});

export const { setStudents, updateStudentRoll } = studentSlice.actions;

export default studentSlice;