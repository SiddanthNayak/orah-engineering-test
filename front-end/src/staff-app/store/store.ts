import { configureStore, combineReducers } from "@reduxjs/toolkit"
import rollInputReducer from "./roll-slice"
import studentSliceReducer from "./student-slice"

const rootReducer = combineReducers({
    rolls: rollInputReducer.reducer,
    students: studentSliceReducer.reducer,
})

export const store = configureStore({
    reducer: {
        reducer: rootReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch