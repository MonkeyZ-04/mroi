import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Bangkok");

export const now = () => dayjs.tz();
export const convertFromDate = (date) => dayjs.tz(date);
