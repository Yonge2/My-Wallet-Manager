import { Request, Response, NextFunction } from 'express'
import { verifyToken } from './jwtUtils'

export default (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization

  if (!accessToken) {
    return res.status(401).json({ error: '토큰 없음' })
  }

  const verifiedToken = verifyToken(accessToken)

  if (!verifiedToken.validation) {
    return res.status(401).json({ error: '유효하지 않은 토큰' })
  }

  const { iat: _iat, exp: _exp, ...payload } = verifiedToken.payload
  req['user'] = payload
  return next()
}
