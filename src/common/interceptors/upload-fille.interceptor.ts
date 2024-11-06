import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { MulterField } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { memoryStorage } from "multer";



export function UploadFileS3(fileName:string){

    return class UploadUtility extends FileInterceptor(fileName,{
        storage:memoryStorage()
    }){}
}
export function UploadFileFieildsS3(uploadFields:MulterField[]){
    return class UploadUtility extends FileFieldsInterceptor(uploadFields,{
        storage:memoryStorage()
    }){}
}