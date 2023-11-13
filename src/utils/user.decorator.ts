import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtUserInfo } from 'src/authorization/jwt.dto'

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

declare global {
  namespace Express {
    export interface User extends JwtUserInfo {}
  }
}
