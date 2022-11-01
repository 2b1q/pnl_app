import axios, { AxiosInstance } from 'axios'

export interface PnlData {
  [epoch: number]: number
}

export type PnlStep = '1h' | '1D' | '1W' | '1M'

export type PnlPeriod = '1M' | '2M' | '3M' | '4M' | '5M' | '6M' | '1Y' | '2Y' | 'ALL'

export class PnlClient {
  client: AxiosInstance | undefined
  constructor() {
    this.client = axios.create({
      baseURL: 'https://hyper-api.plasma.finance/v1/address/',
      headers: { 'x-plasma-api-key': process.env.REACT_APP_API_KEY },
    })
  }

  public async getPnl(address: string, step: PnlStep, pnlPeriod: PnlPeriod): Promise<PnlData> {
    const params = { step, period: pnlPeriod }

    const response = await this.client?.get<PnlData>(`${address}/pnl`, { params })

    return response?.data as PnlData
  }
}
