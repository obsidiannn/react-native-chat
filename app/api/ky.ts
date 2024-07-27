import { SystemService } from 'app/services/system.service';
import ky from 'ky';
const instance = ky.create({
    prefixUrl: SystemService.GetApiUrlByCache(),
    hooks: {
        beforeRequest: [
            async (request) => {
                // 测试
            },
        ],
        afterResponse: [
            async (request, options, response) => {
            },
        ],
    }
});
export const createInstance = (en = true) => {
    return ky.extend({
        hooks: {
            beforeRequest: [
                async (request) => {
                    // 测试
                },
            ],
            afterResponse: [
                async (request, options, response) => {
                },
            ],
        }
    })
}