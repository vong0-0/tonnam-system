export function createHttpError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status })
}
