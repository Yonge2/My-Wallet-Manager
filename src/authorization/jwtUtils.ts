import * as jwt from 'jsonwebtoken'
import { JwtUserInfo } from './jwt.dto'
import redisClient from 'src/utils/redis'

const SECRET_KEY = process.env.JWT_SECRECT_KEY || ('secret' as string)
const AT_EXPIRED = process.env.AT_EXPIRE || ('1h' as string)
const RT_EXPIRED = process.env.RT_EXPIRE || ('1h' as string)
const RT_EXPIRED_BY_NUMBER = 60 * 60 * 24 * Number(process.env.RT_EXPIRED_BY_NUMBER || 1)

export const createAccessToken = (user: JwtUserInfo): string => {
  const payload = { id: user.id, name: user.name }

  return jwt.sign(payload, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: AT_EXPIRED,
  })
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    if (typeof decoded === 'string') return { validation: false }
    return {
      validation: true,
      payload: decoded,
    }
  } catch {
    return { validation: false }
  }
}

export const createRefreshToken = async (userId: number): Promise<string> => {
  const newRefreshToken = jwt.sign({}, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: RT_EXPIRED,
  })
  const refreshTokenKey = `refreshToken_${userId}`
  const re = await redisClient.set(refreshTokenKey, newRefreshToken, {
    EX: RT_EXPIRED_BY_NUMBER,
  })

  console.log(re)
  console.log(await redisClient.get(refreshTokenKey))

  return newRefreshToken
}

//재발급 리팩토링 필요!!(11-11기준)
export const verifyRefreshToken = async (refreshToken: string, userId: number) => {
  const refreshTokenKey = `refreshToken_${userId}`
  const userRt = await redisClient.get(refreshTokenKey)
  console.log(userRt)
  console.log(refreshToken)
  if (userRt === refreshToken) {
    const decoded = verifyToken(refreshToken)
    return decoded.validation
  }
  return false
}
