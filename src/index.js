import request, { extend, fetch } from './request';
import Onion from './onion/onion';
import { RequestError, ResponseError } from './utils';

export { extend, RequestError, ResponseError, Onion, fetch };
export default request;
