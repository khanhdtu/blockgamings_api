/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import CircularJSON from 'circular-json';
import {Address} from '../models';
import {
  AddressRepository,
  CustomerRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class AddressService {
  model = 'address';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/address`;
  migrationAt = parseFloat(process.env.MIGRATED_AT ?? '0');
  currentMigrationId = '';
  startTime = 0;
  endTime = 0;
  startUpdateTime = 0;
  endUpdateTime = 0;
  totalMigrated = 0;
  limit = 500;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(AddressRepository)
    public addressRepo: AddressRepository,

    @repository(CustomerRepository)
    public customerRepo: CustomerRepository,
  ) {
    console.log(this.url)
  }

  /*
   * Add service methods here
   */
  async init() {
    const migrated = await this.migrationRepo.findOne({
      where: {model: this.model},
    });
    if (migrated) {
      this.modelId = migrated.id ?? '';
      await this.migrationRepo.updateById(migrated.id, {
        migratedAt: this.migrationAt,
      });
    } else {
      const migration = await this.migrationRepo.create({
        model: this.model,
        migratedAt: this.migrationAt,
        completed: false,
      });
      this.modelId = migration.id ?? '';
    }
  }

  async newAddresses() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const addressesV1 = await this.addressRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (addressesV1.length) {
        const addressesV2 = await this.toAddressesV2(addressesV1);
        await axios.post(this.url, {addresses: addressesV2});
        const message = `${addressesV1.length} records of ADDRESS was migrated successfully`;
        console.log(message);
      }
      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });
      const message = `ADDRESS migrated at: ${new Date(this.endTime * 1000)}`;
      console.log(message);
      return message;
    } catch (error) {
      await this.migrationRepo.updateById(this.currentMigrationId, {
        model: this.model,
        migratedAt: this.migrationAt,
        completed: false,
      });
    }
  }

  async migrateAll() {
    try {
      const addresses = await this.addressRepo.find();
      const addressesV2 = await this.toAddressesV2(addresses);
      const migrated = await axios.post(this.url, {addresses: addressesV2});
      const res = CircularJSON.stringify(migrated);
      return res;
    } catch (error) {
      return error;
    }
  }

  async toAddressesV2(list: Address[]) {
    return new Promise(resolve => {
      const out: any[] = [];
      list.map(async (address, index) => {
        const customer = await this.customerRepo.findOne({
          where: {UserName: address.user_name},
        });
        out.push({
          id: address._id,
          userId: customer?._id,
          username: address.user_name,
          address: address.address,
          coinCode: address.coin,
          server: address.server,
          status: address.status,
          createdAt: new Date(address.time_created ?? '').getTime(),
          updatedAt: new Date(address.time_modified ?? '').getTime(),
        });
        if (index === list.length - 1) {
          resolve(out);
        }
      });
    });
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Address table is locked');
        return;
      } else {
        console.log('---start migration address---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async address => {
          try {
            await axios.post(this.url, {
              address: {
                id: address._id,
                userId: address.userId,
                username: address.user_name,
                address: address.address,
                coinCode: address.coin,
                server: address.server,
                status: address.status,
                createdAt: new Date(address.time_created ?? '').getTime(),
                updatedAt: new Date(address.time_modified ?? '').getTime(),
              },
            });
            await this.migrationFailedRepo.deleteById(address._id);
            console.log(`done error address: ${address._id}`);
          } catch (error) {
            console.log('error address again:', address._id, error);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const addresses = await this.addressRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        addresses.map(async address => {
          const customer = await this.customerRepo.findOne({
            where: {UserName: address.user_name},
          });
          try {
            const _address = await axios.post(this.url, {
              address: {
                id: address._id,
                userId: customer?._id ?? '0',
                username: address.user_name,
                address: address.address,
                coinCode: address.coin,
                server: address.server,
                status: address.status,
                createdAt: new Date(address.time_created ?? '').getTime(),
                updatedAt: new Date(address.time_modified ?? '').getTime(),
              },
            });
            if (_address.data.statusCode === 200) {
              console.log('done address:', address._id);
            } else {
              console.log('address error something:', _address.data.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _address.data.statusCode,
                userId: customer?._id ?? '0',
                ...address,
              });
            }
          } catch (error) {
            console.log('error address:', address._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              userId: customer?._id ?? '0',
              ...address,
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
