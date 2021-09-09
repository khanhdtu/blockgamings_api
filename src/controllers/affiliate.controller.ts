import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import {
  post,
  param,
  get,
  put,
  del,
  requestBody,
  response,
  getModelSchemaRef,
} from '@loopback/rest';
import { Filter } from '@loopback/repository';
import { MESSAGE } from '../constants';
import { IResponse, IResponseList } from '../interfaces';
import { KeyBindings } from '../keys';
import { Affiliate } from '../models';
import { AffiliateService, author } from '../services';

export class AffiliateController {
  constructor(
    @inject(KeyBindings.AFFILIATE_SERVICE)
    public affiliateService: AffiliateService
  ) {}

  @get('affiliates/weekly-volume')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Affiliate, {includeRelations: true})
        }
      }
    },
  })
  async findWeekly(
    @param.filter(Affiliate) filter: Filter,
    @param.query.string('search') search: string): Promise<IResponseList<Affiliate>> {
    try {
      return await this.affiliateService.getVolume(filter, search)
    } catch (error) {
      return error
    }
  }

  @get('affiliates/weekly-commission')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Affiliate, {includeRelations: true})
        }
      }
    },
  })
  async find(
    @param.filter(Affiliate) filter: Filter,
    @param.query.string('search') search: string): Promise<IResponseList<Affiliate>> {
    try {
      return await this.affiliateService.getCommission(filter, search)
    } catch (error) {
      return error
    }
  }

  @post('affiliates')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Object of Affiliate model instances',
    content: {
        'application/json': {
        schema: getModelSchemaRef(Affiliate, {includeRelations: true})
      }
    },
  })
  async create(
    @requestBody({
      description: 'Create new affiliate request',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Affiliate, {exclude: ['id']})
        }
      }
    }) affiliate: Omit<Affiliate, 'id'>) {
    try {
      await this.affiliateService.createAffiliate(affiliate)
    } catch (error) {
      return error
    }
  }

  @put('affiliates/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Object of Affiliate model instances',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Affiliate, {includeRelations: true})
      }
    },
  })
  async update(
    @requestBody({
      description: 'Object of Affiliate model instances',
      content: {
          'application/json': {
          schema: getModelSchemaRef(Affiliate)
        }
      }
    }) affiliate: Promise<IResponse<Affiliate>>) {
    try {
      const updating = new Affiliate({ ...affiliate, affiliateType: 'WEEKLY-COMMISSION' })
      const updated = await this.affiliateService.updateAffiliate(updating)
      return updated;
    } catch (error) {
      return error
    }
  }

  @del('affiliates/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    description: 'Delete a affiliate response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: {message: 'Affiliate is deleted successfully!'}
        }
      }
    },
  })
  async delete(@param.path.string('id') id: string): Promise<IResponse<string>> {
    try {
      await this.affiliateService.deleteAffiliate(id)
      return {
        statusCode: 200,
        message: MESSAGE.AFFILIATE_DELETED_SUCCESS,
        data: id
      }
    } catch (error) {
      return error
    }
  }
}
