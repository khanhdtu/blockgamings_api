import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MESSAGE } from '../constants';
import { IResponse, IResponseList } from '../interfaces';
import { AffiliateRepository } from '../repositories';
import { Affiliate } from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class AffiliateService {
  constructor(
    @repository(AffiliateRepository)
    public affiliateRepo: AffiliateRepository,
  ) {}

  async getCommission(filter = {}, search = ''): Promise<IResponseList<Affiliate>> {
    const list = await this.affiliateRepo.find({
      where: { affiliateType: 'WEEKLY-COMMISSION' },
      order: ['createdAt DESC'],
      ...filter,
    })

    const { count } = await this.affiliateRepo.count({ affiliateType: 'WEEKLY-COMMISSION' })

    return {
      statusCode: 200,
      data: { list, count }
    }
  }

  async getVolume(filter = {}, search = ''): Promise<IResponseList<Affiliate>> {
    const list = await this.affiliateRepo.find({
      where: { affiliateType: 'WEEKLY-VOLUME' },
      order: ['createdAt DESC'],
      ...filter,
    })

    const { count } = await this.affiliateRepo.count({ affiliateType: 'WEEKLY-VOLUME' })

    return {
      statusCode: 200,
      data: { list, count }
    }
  }

  async createAffiliate(affilate: Affiliate): Promise<IResponse<Affiliate>> {
    const affiliate = await this.affiliateRepo.create(affilate)
    return {
      statusCode: 200,
      data: affiliate,
    }
  }

  async updateAffiliate(affiliate: Affiliate): Promise<IResponse<Affiliate>> {
    const updating = new Affiliate({
      ...affiliate,
      // updatedAt: new Date().getTime()
    })
    await this.affiliateRepo.updateById(affiliate.id, updating)
    return {
      statusCode: 200,
      message: MESSAGE.AFFILIATE_UPDATED_SUCCESS,
      data: updating
    }
  }

  async deleteAffiliate(id: string): Promise<IResponse<Affiliate>> {
    const founded = await this.affiliateRepo.findById(id)
    if (!founded) {
      throw new HttpErrors.Forbidden(MESSAGE.AFFILIATE_NOT_FOUND)
    }
    await this.affiliateRepo.deleteById(id)
    return {
      statusCode: 200,
      message: MESSAGE.USER_DELETED_SUCCESS,
      data: founded
    }
  }
}