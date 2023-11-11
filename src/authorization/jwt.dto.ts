export interface JwtUserInfo {
  id: number
  name: string
}

declare module 'jsonwebtoken' {
  export interface JwtPayload extends JwtUserInfo {}
}
