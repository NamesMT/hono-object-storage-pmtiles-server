import type { AwsLiteClient } from '@aws-lite/client'
import awsLite from '@aws-lite/client'
import { env } from 'std-env'

let tigrisMain: AwsLiteClient | undefined

export async function getTigrisMain() {
  if (!tigrisMain)
    throw new Error('Provider not initialized')

  return tigrisMain
}

export async function initTigrisMain() {
  // Make sure all envs are set
  if (!env.TIGRIS_MAIN_KEY_ID || !env.TIGRIS_MAIN_KEY_SECRET)
    throw new Error('Missing env for `tigris-main` provider')

  const aws = await awsLite({
    region: 'auto',
    endpoint: 'https://fly.storage.tigris.dev',
    plugins: [import('@aws-lite/s3')],
    accessKeyId: env.TIGRIS_MAP_KEY_ID!,
    secretAccessKey: env.TIGRIS_MAP_KEY_SECRET!,
  })

  tigrisMain = aws
}
