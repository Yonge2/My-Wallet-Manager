import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/db/entity/user.entity'
import { Cron, CronExpression } from '@nestjs/schedule'
import redisClient from 'src/utils/redis'
import * as dayjs from 'dayjs'
import * as nodemailer from 'nodemailer'

const MAILER_EMAIL = process.env.MAILER_EMAIL || ('' as string)
const MAILER_PASSWORD = process.env.MAILER_PASSWORD || ('' as string)
const REDIS_ALRAM_KEY = 'ALRAM'

@Injectable()
export class AlramService {
  @InjectRepository(User)
  private readonly repo: Repository<User>

  // 추천 예산 : 총 예산-(해당 월의 여태까지 사용한 총 예산)/남은 일수, 카테고리1/총예산, 카테고리2/총예산, ...
  // 이후 곱해서 전송
  // 그리고 캐싱해서 저녁시간에 써먹기
  // 이유: 어플리케이션 특성상 예산 설정 및 지출 등 아침에는 부하가 적을 것으로 예상
  //CronExpression.EVERY_DAY_AT_7AM
  @Cron('30 * * * * *', { name: 'bePay', timeZone: 'Asia/Seoul' })
  async bePay() {
    console.log('run scheduler')
    //[{name, email, totalAmount(목표 예산 금액), sum(여태 이번달 쓴 금액), leftAmount(오늘 추천 금액)}]
    const bePayData = await this.repo.query(
      `select u.name as name, u.email as email, s.total_amount as totalAmount, SUM(w.amount) as sum,
       (s.total_amount-SUM(w.amount))/(30-DATE_FORMAT(NOW(), '%d'))as leftAmount 
       from user u join set_budget s on u.id=s.user_id join wallet_history w on u.id=w.user_id group by w.user_id`,
    )
    console.log(bePayData)

    bePayData.forEach(
      async (ele: { name: string; email: string; totalAmount: number; sum: number; leftAmount: number }) => {
        //최소금액 만원
        ele.leftAmount = ele.leftAmount <= 0 ? 10000 : ele.leftAmount
        const { name: _name, email: _email, ...data } = ele
        const mailInfo = await mailObj(ele.name, ele.email, '권장 예산', data)
        await sendMail(mailInfo)
        await redisClient.set(`${REDIS_ALRAM_KEY}_${ele.email}`, ele.leftAmount) //오늘 쓸 금액
      },
    )
    return
  }

  // 오늘 결산, 오늘 쓴 금액/써야했을 금액, 위험도
  @Cron(CronExpression.EVERY_DAY_AT_8PM, { name: 'bePay' })
  async piad() {
    const yesterday = dayjs().subtract(1, 'd').format('YYYY-MM-DD')
    const tomorrow = dayjs().add(1, 'd').format('YYYY-MM-DD')
    const todayPaid = await this.repo.query(
      //오늘 쓴 총 금액 { email, sum }
      `select u.name as name, u.email as email, SUM(w.amount) as paid from user u join wallet_history w on u.id=w.user_id 
      where w.createdAt > '${yesterday}' and w.createdAt < '${tomorrow}' group by user_id;`,
    )

    todayPaid.forEach(async (ele: { name: string; email: string; paid: number }) => {
      const leftAmount = await redisClient.get(`${REDIS_ALRAM_KEY}_${ele.email}`)
      console.log('남은금액', leftAmount)
      const risk = (ele.paid / parseInt(leftAmount)) * 100
      const data = {
        leftAmount: leftAmount,
        paid: ele.paid,
        risk: risk,
      }
      const mailInfo = await mailObj(ele.name, ele.email, '결산 내역', data)
      await sendMail(mailInfo)
    })
    return
  }
}

const sendMail = async (mailObj) => {
  const mailTransport = nodemailer.createTransport(mailObj.createMailObj)

  mailTransport.sendMail(mailObj.mailOptions, (err, info) => {
    if (err) {
      console.log('email 발송오류 : ', err)
    } else {
      console.log(info.envelope.to, ' 에게 인증메일 발송')
    }
  })
}

const mailObj = async (name: string, email: string, topic: string, data) => {
  const title = `[My Wallet Manager] ${name}님의 오늘 ${topic}을 알려드릴게요!` //권장 예산 or 사용 내역
  const text = (topic: string, data) => {
    if (topic === '권장 예산')
      return `\n
      이번 달 목표한 예산은 ${data.totalAmount}원 이네요! \n
      그 중, 오늘까지 사용한 예산은 ${data.sum}원 입니다! \n
      오늘은 ${data.leftAmount}원 만큼만 사용하는 것을 목표로 해보아요!`
    else
      return `\n
    오늘도 수고하셨습니다! \n
    오늘은 ${data.leftAmount}원 만큼만 사용하는 것을 목표로 했었는데요, \n 
    오늘 사용한 금액은 ${data.paid}원 만큼 사용하셨네요!\n
    달성 목표 위험도는 ${data.risk}% 입니다!`
  }
  return {
    createMailObj: {
      service: 'Gmail',
      auth: { user: MAILER_EMAIL, pass: MAILER_PASSWORD },
      tls: {
        rejectUnauthorized: false,
      },
    },
    mailOptions: {
      from: MAILER_EMAIL,
      to: email,
      subject: title,
      text: text(topic, data),
    },
  }
}
