import { createInstance } from "@/lib/request-instance"
import { IServer } from "types/server";


export const getLists = async (): Promise<{
    nodes: IServer.INode[]
}> => await createInstance(false).post('/sys/nodes/getLists')