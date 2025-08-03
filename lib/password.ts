import bcrypt from 'bcryptjs'

export function saltAndHashPassword(password: string): string {
  const saltRounds = 12
  const salt = bcrypt.genSaltSync(saltRounds)
  return bcrypt.hashSync(password, salt)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}