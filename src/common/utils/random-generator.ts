import {randomBytes} from "crypto";

export function randomHexGenerator(length = 6): string  {
  return randomBytes(length).toString('hex')
}
