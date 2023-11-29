# My-Wallet-Manager

<p align="center"> <img src="https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/0af17468-2c58-4e5d-9cd1-2e765baefab7" width="450" height="450"/> </p>

본 서비스는 사용자들이 개인 재무를 관리하고 지출을 추적하는 데 도움을 주는 애플리케이션입니다. 이 앱은 **사용자들이 예산을 설정**하고 **지출을 모니터링**하며 재무 목표를 달성하는 데 도움이 됩니다.

<br/>

## 목차

[1. 사용기술](#사용-기술)  
 [2. 기능 목록](#기능)  
 [3. 프로젝트 분석 및 계획](#분석-및-프로젝트-계획)

## 사용 기술

<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white"/> <img src="https://img.shields.io/badge/nestjs-E0234E?style=flat-square&logo=nestjs&logoColor=white"/>

<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/> <img src="https://img.shields.io/badge/TypeORM-000000?style=flat-square&logo=&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>

<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>

<br/>

## 기능 요약

- 유저 인증
  - JWT를 이용한 stateless 유저 인증
  - accessToken과 refreshToken을 통한 관리
- 예산 설정
  - 총 예산과 카테고리에 맞게 각 예산을 지정
- 예산 설정 추천
  - 예산을 설정한 모든 유저의 평균치를 받음
- 지출 기록 추적 (생성 / 조회 / 수정 / 삭제)
- 지출 알림
  - 매일 아침 지출 권장 예산
  - 매일 저녁 지출 결산과 분석
- 지출 통계
  - 지난 달의 오늘까지의 사용 금액 / 대비 / 이번 달의 오늘까지의 사용 금액
  - 여태 까지의 같은 요일 사용 금액 평균 /대비/ 오늘 사용 금액
  - 다른 유저의 예산 사용률 /대비/ 나의 예산 사용률

<br/>

## 프로젝트 분석 및 계획

- [요구사항 분석 후 이슈생성](https://github.com/Yonge2/My-Wallet-Manager/issues)
- [github 프로젝트 기능, 로드맵 생성](https://github.com/users/Yonge2/projects/5)

  - <details>
     <summary>로드맵 보기 - click</summary>

    ![loadmap](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/c623a701-c884-4734-97c6-b89cde87d9a4)
    </details>

- [프로젝트 분석 및 전체 계획 과정](https://github.com/Yonge2/My-Wallet-Manager/issues/1)

### ERD

![mywallet-erd](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/91d15f06-5ce3-470b-960e-4d7c049be3b1)

<br/>

## 구현과 로직

### 구현 의도와 함께 토글을 펼치면 순서도를 확인할 수 있습니다.

### <로그인>

- 로그인으로 토큰을 발급합니다. <br>

  ![로그인](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/aa7698a1-90b7-4859-aeda-61ad7fa9b2e9)

### <인증 작업>

- 접근 권한이 필요한 작업에는 토큰 검증 미들웨어를 사용

  ![토큰검증](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/07dd5159-47da-4a6a-8b0f-b6d967e77d09)

### <예산 설정>

- 사용자가 예산을 수동으로 설정합니다.
- 참여한 인원에 따라 설정한 총 예산과 각 항목에 가중치를 부여하여 평균을 계산하여 redis에 저장합니다. (이후, 예산 추천을 위한 데이터)
- 유저 평균은 하나의 데이터이기 떄문에 stringify로 string 형태로 저장했습니다.
- 장점 : 추가 DB 작업이 필요없음, 이후 작업이 상당히 빠름
- 단점 : 서버가 꺼지면, 크리티컬한 문제가 발생. -> 이후, DB에 저장하거나 직접 통계 구하는 방법 추가 예정.

![예산 설정](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/6b36ba2c-a01e-47b3-bc4d-a11ee347d473)

### <예산 추천>

- 예산 설정 시, 캐싱된 데이터를 사용합니다.
- <예산 설정>의 문제점과 마찬가지로, 이후 서버 꺼졌을 때를 대비 해야합니다.

![예산 추천](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/76bfe9db-5062-4e36-9e59-951dad0d9568)

### <알림>

![email_1](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/39b6210f-6cca-4a9c-85a8-1fa8be1ba396)

#### 오전 8시 - 오늘의 권장 예산 알림

![email_2](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/21ce00bc-d409-414d-9162-db995b43a83c)

- 사용자의 Email로 { 이번달 설정 예산, 이번달 사용한 금액, 금일 사용 권장 금액 }을 발송합니다.
- 금일 사용권장 금액은 (총예산-사용예산)/남은일수로 계산하며, 일정치 이하로 남았을 경우, 최소금액을 발송합니다.
- 권장금액을 목표금액으로 설정하고 redis에 캐싱합니다. (삭제 주기는 오후 8시 이후)

#### 오후 8시 - 오늘의 지출 결산 알림

![email_3](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/b9f7b71c-8f9f-4c09-a7d0-14d3e62d7a99)

- 사용자의 Email로 { 금일 목표 금액, 금일 사용 금액, 위험도 }를 발송합니다.
- 위험도는 사용 금액/목표 금액의 백분율로 계산합니다.
- 목표 금액은 유저마다 redis에 캐싱된 데이터를 이용합니다.

![스케줄러](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/9b2c5df5-9be4-4d30-aa1c-04b4e8367849)

### <지출 통계>

- path param을 이용하여, bymonth, byweek, byuser 로 통계를 볼 수 있습니다.
- bymonth : (이번 달의 오늘까지 쓴 금액 / 지난 달의 오늘까지 쓴 금액) 의 백분율
- byweek : (오늘 쓴 금액 / 여태까지 지난 요일들의 쓴 금액의 평균) 의 백분율
- byuser : (나의 총 예산대비 오늘까지 쓴 금액 비율) / (다른 유저들의 총 예산대비 오늘까지 쓴 금액 비율) 의 백분율

- 위의 모든 통계들은 분자는 계산할 때마다 가변적이지만, 분모는 하룻동안은 고정적입니다. -> 따라서 분모는 하룻동안 캐싱하여 활용합니다.

![통계](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/4fa32500-cf67-4e0a-8a6c-2a9a0b82d7ce)

## API Docs

- url : http://localhost:3000/api-docs#/
- <details>
    <summary> Swagger Ui </summary>

  ![스웨거](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/5f449b6d-5264-4050-b7f3-0480f109c296)
  </details>

## 프로젝트 후

### 의의

- 프로젝트 관리의 효율 상승

  - 1.프로젝트 분석 후 task 정리
  - 2.프로젝트의 task 단위로 issue 생성
  - 3.일정에 맞추어 issue로 loadmap을 작성

- nestjs를 사용한 첫 프로젝트

  - 하나의 기능을 모듈/컨트롤러/서비스로 나누어 개발 -> 유지보수에 용이
  - DTO 선언으로 type 안전성 확보와 관리 용이
  - nest-cli를 통한 개발 능률 상승(directory 구조 알아서 정리)

- 컨벤션
  - 커밋 컨벤션과 코드 컨벤션을 고려한 개발
