export type JSONData = Record<string, any>;
export interface Message {
    count: number,
    duration: number
  }

export interface Request {
    url: string,
    method: string
}

type SetHeader = (a:string, b:string) => string;
type End = (a:string) => string
export interface Response {
  statusCode:number,
  setHeader:SetHeader,
  end:End
}