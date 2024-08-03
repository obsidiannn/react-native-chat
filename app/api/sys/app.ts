import { createInstance } from '../req';
import { IServer } from "@repo/types";
export interface IGetVersionsParams {
    platform: string;
    language: string;
    offset: number;
    limit: number;
}   
const getVersions = async (params: IGetVersionsParams): Promise<{
    list: IServer.IAppVersion[]
}> => await createInstance(true).post('/sys/app/versions',params);

export default {
    getVersions,
}