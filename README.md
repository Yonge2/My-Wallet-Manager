# My-Wallet-Manager

<p align="center"> <img src="https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/0af17468-2c58-4e5d-9cd1-2e765baefab7" width="450" height="450"/> </p>
<p align="center"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=Typescript&logoColor=white"/> <img src="https://img.shields.io/badge/nestjs-E0234E?style=flat-square&logo=nestjs&logoColor=white"/> | <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/> <img src="https://img.shields.io/badge/TypeORM-000000?style=flat-square&logo=&logoColor=white"/> <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/> | <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/> <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=white"/> <img src="https://img.shields.io/badge/JEST-339933?style=flat-square&logo=&logoColor=white"/>

본 서비스는 사용자들이 개인 재무를 관리하고 지출을 추적하는 데 도움을 주는 백엔드 애플리케이션입니다. 이 앱은 **사용자들이 예산을 설정**하고 **지출을 모니터링**할 수 있도록 하는 **REST API를 제공**합니다.

<br/>

## 목차

### [0. 프로그램 실행](#0-프로그램-실행)

### [1. 개발 환경](#1-개발-환경)

### [2. 프로젝트 구조](#2-프로젝트-구조)

### [3. 기능](#3-기능)

### [4. 주요 로직](#4-주요-로직)

### [5. 테스트](#5-테스트)

<br/>
<br/>

## 0. 프로그램 실행

- #### 실행

  ```shell
  #저장소를 클론합니다.
  git clone https://github.com/Yonge2/My-Wallet-Manager.git

  #프로그램 이미지를 빌드하고, 실행합니다.
  docker compose up
  ```

- #### \*wait-for-it 쉘 스크립트 사용

  - [wait-for-it : github](https://github.com/vishnubob/wait-for-it)
  - MySQL 서버와 Redis 서버의 실행이 완료 된 후, NestJS 서버를 실행할 수 있음.( connection err )
  - depoends_on은 실행 순서만 보장하기 때문에, MySQL서버와 Redis서버의 실행 완료에 따른 순차 실행을 보장하기 위한 wait-for-it shell script 사용

  ```yml
  #docker-compose.yml의 services : app : command
  command:
    - bash
    - -c
    - |
      /app/wait-for-it.sh db:3306 -s -t 10 -- npm run start
  ```

<br/>
<br/>

## 1. 개발 환경

- 작업
  - IDE - VScode
  - 저장소 - git, GitHub
  - 로컬 실행 - powershell (windows10)
  - 가상화 실행환경 - WSL2 (Ubuntu 20.04)
- 개발
  - Runtime - Node.js 20.9
  - RDBMS - MySQL 8.0
  - ORM - TypeORM 0.3
  - NoSQL DBMS - Redis 6.2
  - Web Framework - NestJS 10.2
  - Test - Jest 29.5
  - 패키지관리 - NPM 10.1
  - 컨테이너, 이미지관리 - Docker 25.0
  - API DOCS - swagger

<br/>
<br/>

## 2. 프로젝트 구조

- #### 전체 구조

  - NestJS App / MySQL DB / Redis 각 독립적인 컨테이너 환경에서 구동

    <img src="https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/3995f974-90c6-4192-b404-c729d835ce6f" width="350" height="240"/>

- #### 서비스별 디렉토리 구조 - Repository Pattern

  - Service Layer와 Repository Layer를 분리함으로써, **비즈니스 로직**과 **데이터 접근 로직**의 응집도 상승 및 결합도 감소

    <img src="https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/3862c0cd-b238-434a-8e1c-7fe83ac260b6" width="350" height="240"/>

<br/>

- #### Entity Relationship Diagram

  ![mywallet-erd](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/f156728e-2fc2-472b-99b0-629a373b4bdc)

  - category N : budget M 관계 해소

    - budget의 세부 예산의 개수는 유동적이기 때문에 여러 개 일 수 있기 떄문에 중간에 budget_category table을 두어 1 : N : 1 관계로 해결

  - Soft Delete
    - 삭제나 수정 작업이 잦은 테이블은 복구 가능성을 생각하여 is_active: tinyint 속성을 넣는 soft delete 방식 채택

<br/>
<br/>

## 3. 기능

- #### 인증/인가

  - JWT를 이용한 stateless 유저 인증
  - accessToken과 refreshToken을 통한 관리
  - NestJS-Guard 를 이용한 요청 간 인증
    - Guard : 오로지 인증/인가를 위해 사용되는 NestJS 미들웨어

- #### 예산 설정

  - 총 예산과 카테고리에 맞게 각 예산을 지정
    - EX . 총 예산 : 10만원, 식비 : 5만원, 교통비: 1만원, ...

- #### 예산 설정 추천

  - 예산을 설정한 모든 유저의 세부 예산 평균치를 백분율로 받음
    - EX . 식비 : 50 %, 교통비 10 %, ...

- #### 지출 기록 추적 (생성 / 조회 / 수정 / 삭제)

  - 카테고리, 금액, 메모, 사진을 기록 (메모와 사진은 선택사항)

- #### 지출 통계

  - **월별** : 지난 달의 오늘까지의 사용 금액 / 대비 / 이번 달의 오늘까지의 사용 금액
  - **일별** : 여태 까지의 같은 요일 사용 금액 평균 /대비/ 오늘 사용 금액
  - **사용자별** : 다른 유저의 예산 사용률 /대비/ 나의 예산 사용률

- ~~지출 알림~~

  - ~~매일 아침 지출 권장 예산~~
  - ~~매일 저녁 지출 결산과 분석~~

<br/>
<br/>

## 4. 주요 로직

### 로그인

- 로그인으로 토큰을 발급합니다. <br>

  ![로그인](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/aa7698a1-90b7-4859-aeda-61ad7fa9b2e9)

<br/>
<br/>

### 인증 작업

- 모든 요청은 Guard Middleware를 통과한 뒤, 수행 및 응답

  ![토큰검증](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/07dd5159-47da-4a6a-8b0f-b6d967e77d09)

<br/>
<br/>

### 예산 설정

- 사용자가 예산을 수동으로 설정하는 방법.

  - DTO에 따른 데이터 수동 입력

- 다른 사용자의 평균치 데이터를 추천 받는 방법.
  - 예산을 설정한 모든 유저의 세부 예산 평균치를 백분율로 받음
    - EX . 식비 : 50 %, 교통비 10 %, ...

<br/>
<br/>

### 예산 추천

- 예산 설정 시, 캐싱된 데이터를 사용합니다.
- <예산 설정>의 문제점과 마찬가지로, 이후 서버 꺼졌을 때를 대비 해야합니다.

![예산 추천](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/76bfe9db-5062-4e36-9e59-951dad0d9568)

<br/>
<br/>

### 지출 통계

- param을 이용하여, 월 별, 일 별, 사용자 별 통계 반환

- bymonth : (이번 달의 오늘까지 쓴 금액 / 지난 달의 오늘까지 쓴 금액) 의 백분율
- byweek : (오늘 쓴 금액 / 여태까지 지난 요일들의 쓴 금액의 평균) 의 백분율
- byuser : (나의 총 예산대비 오늘까지 쓴 금액 비율) / (다른 유저들의 총 예산대비 오늘까지 쓴 금액 비율) 의 백분율

- 위의 모든 통계들은 분자는 계산할 때마다 가변적이지만, 분모는 하룻동안은 고정적입니다. -> 따라서 분모는 하룻동안 캐싱하여 활용합니다.

![통계](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/4fa32500-cf67-4e0a-8a6c-2a9a0b82d7ce)

<br/>
<br/>

## ~~<알림>~~

<details>
<summary> 보류 </summary>

![email_1](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/39b6210f-6cca-4a9c-85a8-1fa8be1ba396)

### 오전 8시 - 오늘의 권장 예산 알림

![email_2](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/21ce00bc-d409-414d-9162-db995b43a83c)

- 사용자의 Email로 { 이번달 설정 예산, 이번달 사용한 금액, 금일 사용 권장 금액 }을 발송합니다.
- 금일 사용권장 금액은 (총예산-사용예산)/남은일수로 계산하며, 일정치 이하로 남았을 경우, 최소금액을 발송합니다.
- 권장금액을 목표금액으로 설정하고 redis에 캐싱합니다. (삭제 주기는 오후 8시 이후)

### 오후 8시 - 오늘의 지출 결산 알림

![email_3](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/b9f7b71c-8f9f-4c09-a7d0-14d3e62d7a99)

- 사용자의 Email로 { 금일 목표 금액, 금일 사용 금액, 위험도 }를 발송합니다.
- 위험도는 사용 금액/목표 금액의 백분율로 계산합니다.
- 목표 금액은 유저마다 redis에 캐싱된 데이터를 이용합니다.

![스케줄러](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/9b2c5df5-9be4-4d30-aa1c-04b4e8367849)

</details>

<br/>
<br/>

## 5. 테스트

### 기능 테스트

작성한 코드가 의도한 대로 작동하는지 여부에 대한 테스트

#### Unit Test

- budgets, categories, histories 총 3 개의 service, 26 개의 테스트코드 작성 및 실행

  - 각 서비스의 Test Case를 작성하고, Success / Fail 을 유도

    - 실행
      ![jest1](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/d5d662ea-f6a8-4a09-ad1c-5eafda8bea44)

    - 결과  
      ![jest2](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/ce0ad2e0-cb80-40ed-84d3-44bca8ab8bc6)

</br>
</br>

### 비기능적 테스트

실행 속도, 효율 등의 고도화 결과에 대한 테스트

#### 준비

- Test Set :
  - TypeORM-Extension을 이용한 fake-data 세팅
  - [준비 과정을 기록한 블로그](https://blog.naver.com/dlwodyd25/223309185124)

#### 테스트

TBD

## API Docs

- url : http://localhost:3000/api-docs#/

  (App 실행 후 접속 가능)

  ![스웨거](https://github.com/Yonge2/My-Wallet-Manager/assets/99579139/5f449b6d-5264-4050-b7f3-0480f109c296)
