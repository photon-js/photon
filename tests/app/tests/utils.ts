import { expect, runCommandThatTerminates } from '@brillout/test-e2e'

export async function runCommandThatThrows(cmd: string, ...errors: [string, ...string[]]) {
  let err: Error | undefined
  try {
    await runCommandThatTerminates(cmd)
  } catch (err_) {
    err = err_ as Error
  }

  expect(err).toBeTruthy()
  for (const error of errors) {
    expect(err?.message).toContain(error)
  }
}
