# ![JW](https://media.discordapp.net/attachments/887272965622870047/1031541290887827476/IMG_5050.jpg?width=25&height=25) JuicyWorlds - Coffe

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
<br>

---

# **What is JuicyWorlds?**

_Juicy-Worlds is a hangout place for millennials who are looking for reference and inspiration as well as to gather with family, friends and others while enjoying a cup of coffee made wholeheartedly._

---

## Table of Contents

- [About Juicy Worlds](#about-Juicy-Worlds)
  - [Understanding the concept of juicy worlds](#What-is-JuicyWorlds?)
- [Table of Contents](#Table-of-Contents)
- [Requirement](#requirement)
- [Installation](#)
  - [Windows](#windows-installation)
  - [Linux](#linux-installation)
- [How to run](#How-to-run)

## Requirement

This repo require a [NodeJS](https://nodejs.org/)

[ENV](#ENV) File

## Windows Installation

First of all, you need to install [Git](https://git-scm.com/download/win) & [NodeJS](https://nodejs.org/). Then open your git bash, and follow this:<br>

```sh
$ git clone https://github.com/salzteam/Juicy-Worlds.git
$ cd Juicy-Worlds
```

## Linux Installation

```sh
$ apt-get update
$ apt-get install git-all
$ apt-get install nodejs-current
$ git clone https://github.com/salzteam/Juicy-Worlds.git
$ cd Juicy-Worlds
```

## How to run

1. Install file using [WINDOWS](#Windows-Installation) OR [LINUX](Linux-Installation)

2. Add .env file at root folder, and add following

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
