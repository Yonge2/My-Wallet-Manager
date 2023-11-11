import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { STATUS_CODES } from 'http'
import { createAccessToken, createRefreshToken, verifyRefreshToken, verifyToken } from 'src/authorization/jwtUtils'

@Injectable()
export class AuthService {
  /**액세스 토큰 재발급,
   * 만료된 엑세스토큰과 만료되지 않은 리프래시 토큰으로 요청
   * 액세스 토큰 검증 -> 액세스 토큰 디코딩 -> 리프래시 토큰 검증 -> 액세스토큰 재발급*/
  createNewAccessToken = async (accessToken: string, refreshToken: string) => {
    const verify = verifyToken(accessToken)
    if (verify.validation) {
      throw new HttpException('토큰이 아직 유효함', HttpStatus.BAD_REQUEST)
    }

    const decoded = jwt.decode(accessToken)

    //토큰 타입이 jwt.JwtPayload가 아닐 시, 유효하지 않음
    const tokenPayload = decoded && typeof decoded != 'string' ? decoded : false
    if (!tokenPayload) {
      throw new HttpException('토큰 정보가 유효하지 않음', HttpStatus.BAD_REQUEST)
    }

    //refresh 검증
    const isValidRefreshToken = await verifyRefreshToken(refreshToken, tokenPayload.id)
    if (!isValidRefreshToken) {
      throw new HttpException('리프래시 토큰이 유효하지 않음, 재로그인 요망', HttpStatus.UNAUTHORIZED)
    }

    const newAccessToken = createAccessToken(tokenPayload)
    return { accessToken: newAccessToken }
  }

  /**리프래쉬 토큰 재발급, 리프래시 토큰 만료 전 재로그인 방지를 위한 프론트 단 자동요청을 가정함
   * 만료되기 전의 refreshToken과 만료되거나 안된 accessToken을 요청(만료시 재로그인)*/
  createNewRefreshToken = async (accessToken: string, refreshToken: string) => {
    const decoded = jwt.decode(accessToken)
    const payload = decoded && typeof decoded != 'string' ? decoded : false
    if (!payload) {
      throw new HttpException('토큰 정보가 유효하지 않음', HttpStatus.BAD_REQUEST)
    }
    const isValidRefesh = await verifyRefreshToken(refreshToken, payload.id)

    if (!isValidRefesh) {
      throw new HttpException('리프래시 토큰이 유효하지 않음, 재로그인 요망', HttpStatus.UNAUTHORIZED)
    }

    const newRefreshToken = await createRefreshToken(payload.userId)
    return { refreshToken: newRefreshToken }
  }
}
