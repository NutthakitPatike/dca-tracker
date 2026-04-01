import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signUpSchema, formatValidationError } from '@/lib/validation'

export async function POST(request: Request) {
  const body = await request.json()
  try {
    const data = signUpSchema.parse(body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const passwordHash = await hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
      },
    })
    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (error) {
    return NextResponse.json({ error: formatValidationError(error) }, { status: 400 })
  }
}
