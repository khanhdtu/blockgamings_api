import {injectable, BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { WalletRepository } from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class WalletService {
  constructor(
    @repository(WalletRepository)
    private walletRepository: WalletRepository
  ) {}

  async getWalletAccounts(filter = {}) {
    await this.walletRepository.find(filter)
  }
}
