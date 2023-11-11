import { Response, NextFunction } from 'express'
import { verifyToken } from './jwtUtils'

export default (req: any, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization

  if (!accessToken) {
    return res.status(401).json({ error: '토큰 없음' })
  }

  const verifiedToken = verifyToken(accessToken)

  if (!verifiedToken.validation) {
    return res.status(401).json({ error: '유효하지 않은 토큰' })
  }

  req.user = verifiedToken.payload
  return next()
}
