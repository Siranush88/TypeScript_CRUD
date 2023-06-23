export type JSONData = Record<string, any>;
export interface Message {
    count: number,
    duration: number
  }

export interface Request {
    url: string,
    method: string
}

type setHeader = (a:string, b:string) => string
export interface Response {
  statusCode:number,
  setHeader:setHeader,
  end:any
}