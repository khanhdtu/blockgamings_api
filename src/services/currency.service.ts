import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { format } from 'date-fns';
import { MESSAGE } from '../constants';
import { IResponse } from '../interfaces';
import { Currency } from '../models';
import { CurrencyRepository } from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class CurrencyService {
  constructor(
    @repository(CurrencyRepository)
    public currencyRepo: CurrencyRepository,
  ) {}

  getCurrencies = async (filter?: string): Promise<IResponse<Currency[]>> => {
    const currencies = await this.currencyRepo.find({ order: ['updatedAt DESC'] });
    if (!filter) return {
      statusCode: 200,
      data: currencies
    }
    const value = filter.trim().toLowerCase();
    return {
      statusCode: 200,
      data: currencies.filter(currency => (
        currency.name?.toLowerCase().includes(value)
      ))
    }
  }

  createCurrency = async (currency: Currency): Promise<IResponse<Currency>> => {
    const newCurrency = new Currency({...currency, createdAt: format(new Date(), 'yyyy-MM-dd hh:mm')})
    const creating = await this.currencyRepo.create(newCurrency);
    return {
      statusCode: 200,
      message: MESSAGE.CURRENCY_CREATED_SUCCESS,
      data: creating
    }
  }

  updateCurrency = async (currency: Currency): Promise<IResponse<Currency>> => {
    const updating = new Currency({ ...currency, updatedAt: new Date().getTime() })
    await this.currencyRepo.updateById(currency.id, updating);
    return {
      statusCode: 200,
      message: MESSAGE.CURRENCY_UPDATED_SUCCESS,
      data: updating
    }
  }

  deleteCurrency = async (id: string): Promise<IResponse<string>> => {
    await this.currencyRepo.deleteById(id);;
    return {
      statusCode: 200,
      message: MESSAGE.CURRENCY_DELETED_SUCCESS,
      data: id
    }
  }
}