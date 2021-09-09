/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import {
  CustomerRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  model = 'user';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/users`;
  currentMigrationId = '';
  currentMigrationAt = 0;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  startTime = 0;
  endTime = 0;
  totalMigrated = 0;
  limit = 500;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(CustomerRepository)
    public customerRepo: CustomerRepository,
  ) {}

  /*
   * Add service methods here
   */
  async init() {
    const migrated = await this.migrationRepo.findOne({
      where: {model: this.model},
    });
    if (migrated) {
      this.modelId = migrated.id ?? '';
      await this.migrationRepo.updateById(migrated.id ?? '', {
        migratedAt: this.migrationAt,
        completed: false,
      });
    } else {
      const created = await this.migrationRepo.create({
        model: this.model,
        migratedAt: new Date().getTime(),
        completed: false,
      });
      this.modelId = created.id ?? '';
    }
  }

  async newUsers() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const usersV2: any[] = [];
      const usersV1 = await this.customerRepo.find({
        where: {
          Time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (usersV1.length) {
        usersV1.map(user => {
          usersV2.push({
            id: user._id,
            username: user.UserName,
            email: user.Email,
            fullName: user.FullName,
            password: user.Password,
            salt: user.PasswordSalt,
            role: user.IsAdmin ? 'ROLE_MANAGER' : 'ROLE_USER',
            sponsor: user.Sponsor,
            sponsorIds: user.ListIntroducerIDs?.split(','),
            blocked: user.IsLocked,
            deposited: user.IsDeposited,
            deletedAt: user.IsDeleted ? new Date().getTime() : 0,
            createdAt: (user.Time ?? 0) * 1000,
            updatedAt: user.time_modified || 0,
          });
        });
        await axios.post(this.url, {users: usersV2});
        const message = `${usersV1.length} records of USER was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `USERS migrated at: ${new Date(this.endTime * 1000)}`;
      return message;
    } catch (error) {
      await this.migrationRepo.updateById(this.currentMigrationId, {
        model: this.model,
        migratedAt: this.endTime,
        completed: false,
      });
    }
  }

  // migration all in once try
  async migrateAll() {
    try {
      const users = await this.customerRepo.find();
      const usersV2: any[] = [];
      if (users.length) {
        users.map(user => {
          usersV2.push({
            id: user._id,
            username: user.UserName,
            email: user.Email,
            fullName: user.FullName,
            salt: user.PasswordSalt,
            role: user.IsAdmin ? 'ROLE_MANAGER' : 'ROLE_USER',
            sponsor: user.Sponsor,
            sponsorIds: user.ListIntroducerIDs?.split(','),
            blocked: user.IsLocked,
            deposited: user.IsDeposited,
            deletedAt: user.IsDeleted ? new Date().getTime() : 0,
            createdAt: (user.Time ?? 0) * 1000,
            updatedAt: user.time_modified ?? 0,
          });
        });
        await axios.post(this.url, {users: usersV2});
        const message = 'all users was migrated successfully';
        console.log(message);
        return message;
      }
      return 'no users to migrate';
    } catch (error) {
      return error;
    }
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('User table is locked');
        return;
      } else {
        console.log('---start migration user---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async user => {
          try {
            const _user = await axios.post(this.url, {
              user: {
                id: user._id,
                username: user.UserName,
                email: user.Email,
                fullName: user.FullName,
                salt: user.PasswordSalt,
                password: user.Password,
                role: user.IsAdmin ? 'ROLE_MANAGER' : 'ROLE_USER',
                sponsor: user.Sponsor,
                sponsorIds: user.ListIntroducerIDs?.split(','),
                blocked: user.IsLocked,
                deposited: user.IsDeposited,
                deletedAt: user.IsDeleted ? new Date().getTime() : 0,
                createdAt: (user.Time ?? 0) * 1000,
                updatedAt: user.time_modified || 0,
              },
            });
            if (_user.data.statusCode === 200 || _user.data.code === 11000) {
              await this.migrationFailedRepo.deleteById(user._id);
              console.log(`done error user: ${user._id}`);
            } else {
              console.log('error user again:', _user.data.code);
            }
          } catch (error) {
            console.log('error user again:', user._id);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const customers = await this.customerRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        customers.map(async user => {
          try {
            const _user = await axios.post(this.url, {
              user: {
                id: user._id,
                username: user.UserName,
                email: user.Email,
                fullName: user.FullName,
                salt: user.PasswordSalt,
                password: user.Password,
                role: user.IsAdmin ? 'ROLE_MANAGER' : 'ROLE_USER',
                sponsor: user.Sponsor,
                sponsorIds: user.ListIntroducerIDs?.split(','),
                blocked: user.IsLocked,
                deposited: user.IsDeposited,
                deletedAt: user.IsDeleted ? new Date().getTime() : 0,
                createdAt: (user.Time ?? 0) * 1000,
                updatedAt: user.time_modified ?? 0,
              },
            });
            if (_user.data.statusCode === 200) {
              console.log('done user:', user._id);
            } else {
              console.log('user error something:', _user.data.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _user.data.statusCode,
                ...user,
              });
            }
          } catch (error) {
            console.log('error user:', user._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              errorCode: error.data.statusCode,
              ...user,
            });
          }
          this.totalMigrated++;
          await this.migrationRepo.updateById(this.modelId, {
            totalMigrated: this.totalMigrated,
          });
        });
      }
    } catch (error) {
      return error;
    }
  }
}
