import { model, property } from "@loopback/repository";

@model()
export class IResponse<T>{
    @property({ jsonSchema: { enum: [200] }}) statusCode: number
    @property() data: T
    @property() message?: string
    @property() error?: unknown
}

@model()
export class IResponseList<T>{
    @property({ jsonSchema: { enum: [200] }}) statusCode: number
    @property() data: {
        list: T[],
        count: number
    }
    @property() message?: string
    @property() error?: unknown
}