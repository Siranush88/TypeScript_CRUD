export type JSONData = Record<string, any>;

export interface Message {
    count: number,
    duration: number
  }

export interface Request {
    url: any,
    method: string
}

export interface Response {
  statusCode:number,
  setHeader:any,
  end:any
}