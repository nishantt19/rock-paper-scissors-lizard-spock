import {z} from 'zod';
import { isAddress } from 'viem';
import { Move } from './constant';

export const createGameSchema = z.object({
    move: z.number().refine((val) => val !== Move.Null && val >= Move.Rock && val <= Move.Lizard, {
        error: 'Please select a valid move'
    }),
    amount: z.string().refine((val)=> !isNaN(Number(val)) && Number(val) > 0, {
        error: 'Please enter a valid ETH Amount greater than 0'
    }),
    opponentAddress: z.string().refine((val)=> isAddress(val), {
        error: 'Invalid Ethereum address'
    }),
    salt: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, {
      error: "Salt must be in hex format starting with 0x"
    }),
})

export const loadGameSchema = z.object({
    contractAddress: z.string().refine((val) => isAddress(val), {
        error: 'Invalid Ethereum address'
    })
})

export type CreateGameFormValues = z.infer<typeof createGameSchema>

export type LoadGameFormValues = z.infer<typeof loadGameSchema>