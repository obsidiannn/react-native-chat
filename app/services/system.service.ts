import { globalKV, globalStorage } from "app/utils/kv-tool"
import { getLists } from "app/api/sys/node"

export class SystemService {
    static GetApiUrlByCache = () => {
        const apiUrl = globalStorage.get('string', 'NOW_API_URL')
        if (apiUrl) {
            return apiUrl as string;
        }
        return process.env.EXPO_PUBLIC_SYSTEM_API_URL;
    }
    static GetApiUrl = () => {

    }

    static GetStaticUrl = (): string => {
        const url = globalKV.get('string', 'NOW_STATIC_URL') ?? ''
        return String(url)
    }


    static refreshNodes = () => {
        const apiUrl = SystemService.GetApiUrlByCache()

        console.log("初始化節點3", apiUrl)
        return new Promise((resolve, reject) => {
            getLists().then(rep => {
                console.log('api list:', rep);
                console.log("rep:", rep);
                const groupByType = rep.nodes.reduce((result, node) => {
                    const { type } = node;
                    if (!result[type]) {
                        result[type] = [];
                    }
                    let proto = "http";
                    if (node.tls == "ON") {
                        proto = "https"
                    }
                    const url = `${proto}://${node.host}:${node.port}`;
                    result[type].push(url);
                    return result;
                }, {} as Record<string, Array<string>>);
                console.log("groupByType:", groupByType);
                if (Object.prototype.hasOwnProperty.call(groupByType, 'STATIC_URL')) {
                    globalKV.set("NOW_STATIC_URL", groupByType['STATIC_URL'][0]);
                    globalKV.set("STATIC_URL_LIST", JSON.stringify(groupByType['STATIC_URL']))
                }
                if (Object.prototype.hasOwnProperty.call(groupByType, 'API_GATEWAY')) {
                    globalKV.set("NOW_API_URL", groupByType['API_GATEWAY'][0]);
                    globalKV.set("API_GATEWAY", JSON.stringify(groupByType['API_GATEWAY']))
                }
                if (Object.prototype.hasOwnProperty.call(groupByType, 'SOCKET_API')) {
                    globalKV.set("NOW_SOCKET_URL", groupByType['SOCKET_API'][0]);
                    globalKV.set("SOCKET_API", JSON.stringify(groupByType['SOCKET_API']))
                }
                resolve(true);
            }).catch((err) => {
                reject(err);
            });
        })
    }
}