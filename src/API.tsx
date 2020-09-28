import axios from 'axios'

const API = axios.create({
  baseURL: 'https://polytech-schedule.herokuapp.com',
  responseType: 'json'
})

export default API
