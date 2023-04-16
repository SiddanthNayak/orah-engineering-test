import moment from "moment"

export const toDisplayDate = (value: Date) => {
    return moment(value, "YYYY-MM-DDThh:mm:ss.SSS").format('MMM Do YYYY')
}