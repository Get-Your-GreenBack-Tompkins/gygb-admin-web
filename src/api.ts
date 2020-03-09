import axios, { AxiosInstance } from "axios";
import { createContext } from "react";

console.log(process.env.REACT_APP_API_URL);

const createApi = (auth_token?: string) => {

  return auth_token
    ? axios.create({
        headers: {
          authorization: `Bearer ${auth_token}`
        },
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000
      })
    : axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000
      });
};

export default createApi;

export const ApiContext = createContext<AxiosInstance>(createApi());
