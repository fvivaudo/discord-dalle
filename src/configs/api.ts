import { env } from '@/env'
import {toNumber} from "@vue/shared";

export const apiConfig: APIConfigType = {

	enabled: false, // is the API server enabled or not
	port: Number(process.env.API_PORT) || 4000, // the port on which the API server should be exposed
}
