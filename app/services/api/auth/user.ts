import { createInstance } from "@/lib/request-instance";

import type { IServer } from "types/server";
import { BaseArrayResp, BaseIdsNumberReq } from "../types/common";
import { OfficialUserItem } from "../types/user";

const getBatchInfo = async (ids: number[]): Promise<{
  users: IServer.IUser[]
}> => await createInstance(true).post('/users/getBatchInfo', { ids: ids.map(id => Number(id)) });
const findByUserName = async (userName: string): Promise<{
  id: number | null
}> => await createInstance(true).post('/users/findByUserName', { userName });

const findOfficialUsers = async (param: BaseIdsNumberReq): Promise<BaseArrayResp<OfficialUserItem>> => await createInstance(true).post('/users/get-official-info', param);


export default {
  getBatchInfo,
  findByUserName,
  findOfficialUsers
}