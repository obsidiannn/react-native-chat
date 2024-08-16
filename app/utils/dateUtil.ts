import dayjs from "dayjs"

const second2Label = (second: number, patten: string = "YYYY-MM-DD hh:mm"): string => {
    if (second <= 0) {
        return ''
    }
    return dayjs(second * 1000).format(patten)
}
export default {
    second2Label
}