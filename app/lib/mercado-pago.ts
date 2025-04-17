import { MercadoPagoConfig } from "mercadopago"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export default mpClient

export function validateMercadoPagoWebhook(request: NextRequest) {
  const xSignature = request.headers.get("x-signature")
  const xRequestId = request.headers.get("x-request-id")

  if (!xSignature || !xRequestId) {
    return NextResponse.json(
      { error: "Missing x-signature or x-request-id" },
      { status: 400 }
    )
  }

  const signatureParts = xSignature.split(",")
  const parts = Object.fromEntries(
    signatureParts.map((part) => part.trim().split("="))
  )
  const ts = parts.ts
  const v1 = parts.v1

  if (!ts || !v1) {
    return NextResponse.json(
      { error: "Invalid x-signature format" },
      { status: 400 }
    )
  }

  const url = new URL(request.url)
  const dataId = url.searchParams.get("data.id")

  let manifest = ""
  if (dataId) manifest += `id:${dataId};`
  manifest += `request-id:${xRequestId};ts:${ts};`

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 }
    )
  }

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(manifest)
  const generatedHash = hmac.digest("hex")

  if (generatedHash !== v1) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  return NextResponse.json({ message: "Signature validated" }, { status: 200 })
}

