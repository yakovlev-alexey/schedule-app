import axios from 'axios'

const API = axios.create({
  baseURL: 'https://ruz.spbstu.ru/api/v1/ruz',
  responseType: 'json'
})

export default API
