/* eslint-disable @typescript-eslint/naming-convention */
import { injectable, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import axios from 'axios';
import { MigrationRepository, UserRepository } from '../repositories';
import CircularJson from 'circular-json';

@injectable({scope: BindingScope.TRANSIENT})
export class MigrationService {
  username = 'OP0Xbb7W89cdxoTce36qefd3DBA/JcBsvOONqOpEOOmF8aXQhBF+E8l/2JlulU7Unpj4P1jqy4NzmuVHKII6gXLCX7LoGqEp/x/OnAmTY1tP+tHkF+fWrKShWP5Gl6VLcdoOm6oSHD4v8/kQhZuqDYLT1TqQpfdtoCybxYr8HgF0J7Zqg7x3EutBSvhbzwTnQ0BUTdDlnCTW6eIvTRx74+H/myMI4VYe/s63erpMF+DWJXLFQrEWgT/6e7tf3j7IPnNk0CPwxYkQY7TXp/h9M50usPXo//OUG2vbp91q05ORFFxzvcX27G7hibgiTvM/RRcv/68c/JkUsSy02jGzzA=='
  password = 'blEt6/3qrsYxNMJwhEyifYWMSLU9LVGCAjUx0ELrKgzTqOQZVuz+YF7Oic6P3cgojbqG23dVV7ESR3oPEfzlJ2yU2CdQ7sOPA8KelgMlrFNGt4dCu6EV+tN5sosBt5/2rXByuXnTnydwRCnS+3qXfH3QswdzhlR2DosiCMpReWKm0nMwFFonMeMGnfBygwYvyxHU6St9pSBxssBc8aKfcVY48ya/sqnBxVziAhQSewLLhBx61KmfcpwE0rz7jlbIqfMFnCHf/agERGsf73TrxDTV7DseynH2OOTFg2SLykU3NxY9KGuv79PjaSqS9sZiG/pVPupj0R517aQkYnyaUg=='
  url = 'https://gamebit777.com/api'
  token = ''
  constructor(
    @repository(UserRepository)
    public userRepo: UserRepository,

    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository
  ) {}

  async init() {
    await this.auth()
    const migrated = await this.migrationRepo.find()
    if (migrated.length) return
    await this.migrationRepo.create({
      userMigratedAt: new Date().getTime(),
      userMigrated: false,
    })
  }

  async auth() {
    const loggedIn = await axios.post(`${this.url}/trade/user/auth`, {
      'user_name': this.username,
      'user_pass': this.password,
      'is_admin': true
    })
    if (loggedIn.data) {
      this.token = loggedIn.data.token
    }
  }

  async users() {
    try {
      const migrated = (await this.migrationRepo.find())[0]

      const users = await axios.get(`${this.url}/trade/admin/customers/get_customers?Token=${this.token}`)
      if (users.data) {
        console.log(users.data.rows)
      }
    } catch (error) {
      console.log(error)
    }
  }
}
