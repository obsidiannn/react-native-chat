// import { createInstance } from "@/lib/request-instance";
// const getUploadPreSignUrl = async (): Promise<{
//     uploadUrl: string;
//     key: string;
// }> => await createInstance(true).post('/sys/s3/getUploadPreSignUrl')


const getUploadPreSignUrl = async (): Promise<{
    uploadUrl: string;
    key: string;
}> => await new Promise((ra, rb) => {
    ra({
        uploadUrl: '1',
        key: '2'
    })
})


export default {
    getUploadPreSignUrl,
}