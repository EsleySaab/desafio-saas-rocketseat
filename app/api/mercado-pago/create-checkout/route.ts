import mpClient from "@/app/lib/mercado-pago"
import { error } from "console"
import { Preference } from "mercadopago"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { testeId, userEmail } = await request.json()

  try {
    const preference = new Preference(mpClient)

    const createdPreference = await preference.create({
      body: {
        external_reference: testeId, // Isso impacta na pontuação do Mercado Pago
        metadata: {
          testeId, // Essa variável é convertida para snake_case --> teste_id
        },
        ...(userEmail && { payer: { email: userEmail } }), // Adiciona o e-mail do usuário se fornecido | Também é importante para pontuação
        items: [
          {
            id: "",
            description: "",
            title: "",
            quantity: 1,
            unit_price: 1,
            currency_id: "BRL",
            category_id: "services",
          },
        ],
        payment_methods: {
          installments: 12,
          // excluded_payment_methods: [
          //   {
          //     id: "bolbradesco",
          //   },
          //   {
          //     id: "pec",
          //   },
          // ],
          // excluded_payment_types: [
          //   {
          //     id: "debit_card",
          //   },
          //   {
          //     id: "credit_card",
          //   },
          // ],
        },
        auto_return: "approved",
        back_urls: {
          success: `${request.headers.get("origin")}/api/mercado-pago/pending`,
          failure: `${request.headers.get("origin")}/api/mercado-pago/pending`,
          pending: `${request.headers.get("origin")}/api/mercado-pago/pending`,
        },
      },
    })

    if (!createdPreference.id) {
      return NextResponse.json(
        {
          error: "Erro ao criar checkout com Mercado Pago",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      preferenceId: createdPreference.id,
      initPoint: createdPreference.init_point,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: "Erro ao criar checkout com Mercado Pago",
      },
      { status: 500 }
    )
  }
}
