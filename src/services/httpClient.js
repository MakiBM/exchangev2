import { HttpClient } from '@0x/connect'
import { API_URL } from '@/config'

let httpClient

export const getHttpClient = async () => {
  if (!httpClient) {
    httpClient = new HttpClient(API_URL)
  }
  return httpClient
}
