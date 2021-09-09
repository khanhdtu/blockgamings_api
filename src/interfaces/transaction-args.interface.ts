export interface IArgsTransactionRequest {
    status?: 'PENDING' | 'COMPLETED' | 'PROCESSING',
    coinCode?: 'USDT' | 'ETH' | 'BTC',
    keyWord?: string,
    dateFrom?: number,
    dateTo?: number,
}