import { createInstance } from "@/lib/request-instance";

const getInfo = async () => await createInstance(true).post('/friendUserExtendInfo/getInfo');

export default {
  getInfo
}