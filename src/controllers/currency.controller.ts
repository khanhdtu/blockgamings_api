import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { IResponse } from '../interfaces';
import { KeyBindings } from '../keys';
import { Currency } from '../models';
import { author, CurrencyService } from '../services';

export class CurrencyController {
  constructor(
    @inject(KeyBindings.CURRENCY_SERVICE)
    public currencyService: CurrencyService
  ) {}

  @get('/currencies')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Currency, {includeRelations: true}),
        },
      },
    },
  })
  async find(): Promise<IResponse<Currency[]>> {
    try {
      return await this.currencyService.getCurrencies()
    } catch (error) {
      return error
    }
  }

  @post('/currencies')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(200, {
    content: {'application/json': {schema: getModelSchemaRef(Currency)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {
            title: 'NewCurrency',
            exclude: ['id'],
          }),
        },
      },
    })
    currency: Omit<Currency, 'id'>,
  ): Promise<IResponse<Currency>> {
    try {
      return await this.currencyService.createCurrency(currency);
    } catch (error) {
      return error
    }
  }

  @put('/currencies/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'Currency PUT success',
  })
  async replaceById(
    @requestBody() currency: Currency,
  ): Promise<IResponse<Currency>> {
    try {
      return await this.currencyService.updateCurrency(currency);
    } catch (error) {
      return error
    }
  }

  @del('/currencies/{id}')
  @authenticate('authen')
  @authorize({allowedRoles: ['ROLE_MANAGER'], voters: [author]})
  @response(204, {
    description: 'Currency DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<IResponse<string>> {
    try {
      return await this.currencyService.deleteCurrency(id)
    } catch (error) {
      return error
    }
  }
}
