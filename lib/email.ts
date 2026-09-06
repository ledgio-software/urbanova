import { Resend } from 'resend'
import { formatPrice } from './format'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  return new Resend(process.env.RESEND_API_KEY)
}

type OrderItem = {
  productName: string
  size: string
  color: string
  quantity: number
  unitPrice: number
}

type SendOrderConfirmationParams = {
  to: string
  customerName: string
  orderId: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  deliveryZone: string
  estimatedDays: string
}

export async function sendOrderConfirmation(params: SendOrderConfirmationParams): Promise<void> {
  const itemRows = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.productName} — ${item.size} / ${item.color}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>`,
    )
    .join('')

  const resend = getResend()
  await resend.emails.send({
    from: 'URBANOVA <orders@urbanova.store>',
    to: params.to,
    subject: 'Your URBANOVA order is confirmed',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
        <div style="background:#0f1f3d;padding:32px;text-align:center">
          <h1 style="color:#f5f4f0;font-size:28px;letter-spacing:4px;margin:0">URBANOVA</h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-size:22px;margin-top:0">YOU'RE IN.</h2>
          <p>Hey ${params.customerName},</p>
          <p>Order <strong>#${params.orderId.slice(-8).toUpperCase()}</strong> is locked in. We're getting it ready to move.</p>
          <p>Expect delivery within <strong>${params.estimatedDays}</strong>.</p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0">
            <thead>
              <tr style="border-bottom:2px solid #0f1f3d">
                <th style="text-align:left;padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Item</th>
                <th style="text-align:center;padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Qty</th>
                <th style="text-align:right;padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="border-top:2px solid #0f1f3d;padding-top:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#666">Subtotal</span><span>${formatPrice(params.subtotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#666">Delivery (${params.deliveryZone})</span><span>${formatPrice(params.deliveryFee)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;margin-top:8px">
              <span>Total</span><span>${formatPrice(params.total)}</span>
            </div>
          </div>

          <p style="margin-top:32px;color:#666;font-size:14px">
            Questions? Just reply to this email or reach us on WhatsApp.<br>
            — Team URBANOVA
          </p>
        </div>
        <div style="background:#f5f4f0;padding:16px;text-align:center;font-size:12px;color:#666">
          &copy; ${new Date().getFullYear()} URBANOVA. Bold City. Bold You.
        </div>
      </div>
    `,
  })
}
