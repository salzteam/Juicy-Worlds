# ![JW](https://media.discordapp.net/attachments/887272965622870047/1031541290887827476/IMG_5050.jpg?width=25&height=25) **JUICY WORLDS - Coffe**

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
<br>

---

# **What is JuicyWorlds?**

_Juicy-Worlds is a hangout place for millennials who are looking for reference and inspiration as well as to gather with family, friends and others while enjoying a cup of coffee made wholeheartedly._

---

## 𓆙 Table of Contents

- [About Juicy Worlds](#about-Juicy-Worlds)
  - [Understanding the concept of juicy worlds](#What-is-JuicyWorlds?)
- [Table of Contents](#Table-of-Contents)
- [Requirement](#requirement)
- [Installation](#)
  - [Windows](#windows-installation)
  - [Linux](#linux-installation)
- [How to run](#How-to-run)

## 𓆙 Requirement

This repo require a [NodeJS](https://nodejs.org/)

[ENV](#ENV) File

## 𓆙 Windows Installation

First of all, you need to install [Git](https://git-scm.com/download/win) & [NodeJS](https://nodejs.org/). Then open your git bash, and follow this:<br>

```sh
$ git clone https://github.com/salzteam/Juicy-Worlds.git
$ cd Juicy-Worlds
```

## 𓆙 Linux Installation

```sh
$ apt-get update
$ apt-get install git-all
$ apt-get install nodejs-current
$ git clone https://github.com/salzteam/Juicy-Worlds.git
$ cd Juicy-Worlds
```

## 𓆙 How to run

1. Install file using [WINDOWS](#Windows-Installation) OR [LINUX](Linux-Installation)

2. Add .env file at root folder on config, and add following

```sh
PORT = 'YOUR_PORT'
DB_HOST_DEV = 'YOUR_DB_HOST'
DB_USER_DEV = 'YOUR_DB_USER'
DB_PASS_DEV = 'YOUR_DB_DEV'
DB_NAME_DEV = 'YOUR_NAME_DEV'
DB_PORT = 'YOUR_DB_PORT'
SECRET_KEY = 'YOUR_SECRET_KEY'
ISSUER = 'YOUR_ISSUER'
REDIS_URL = 'YOUR_REDIS_URL'
REDIS_USER = 'YOUR_REDIS_USER'
REDIS_PWD = 'YOUR_REDIS_PASSWORD'
```

3. Starting application

```sh
$ npm run dev
```

## 𓆙 Route

| Endpoint                     |      Method      | Info         | Remark                                |
| ---------------------------- | :--------------: | :----------- | :------------------------------------ |
| /api/auth                    | `DELETE` `POST`  | Auth         | Login, Logout                         |
| /api/users                   |      `GET`       | User         | Get Users (admin)                     |
| /api/users/register          |      `POST`      | Auth         | Register                              |
| /api/users/account           |      `POST`      | User         | Change Password                       |
| /api/users/profile           |     `PATCH`      | User         | Create Profile                        |
| /api/users/profile/edit      |     `PATCH`      | User         | Change Profile                        |
| /api/transactions            |      `GET`       | Transactions | History transactios all users( admin) |
| /api/transactions/history    |      `GET`       | Transactions | History Transaction                   |
| /api/transactions/create     |      `POST`      | Transactions | Create Transaction                    |
| /api/transactions/edit/:id   |     `PATCH`      | Transactions | Edit Transaction (admin)              |
| /api/transactions/delete/:id |     `DELETE`     | Transactions | Delete Transaction (admin)            |
| /api/products                |   `POST` `GET`   | Products     | Create and See Products               |
| /api/products/:id            | `PATCH` `DELETE` | Products     | Delete and Edit Products              |
| /api/products/favorite       |      `GET`       | Products     | Products favorite                     |
| /api/promo                   |      `GET`       | Promo        | Detail Promo                          |
| /api/promo/create            |      `POST`      | Promo        | Add Promo                             |
| /api/promo/edit/:id          |     `PATCH`      | Promo        | Edit Promo                            |
| /api/promo/delete/:id        |     `DELETE`     | Promo        | Delete Promo                          |

## 𓆙 Documentation Postman

Click here [POSTMAN](https://documenter.getpostman.com/view/23707233/2s83ziMNko)

<BR>
<BR>

<h1 align="center"> THANK FOR YOUR ATTENTION </h1>
