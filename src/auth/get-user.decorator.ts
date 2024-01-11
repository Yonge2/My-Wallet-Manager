import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserInfo => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

export interface UserInfo {
  id: string
  name: string
  isManager: boolean
}
