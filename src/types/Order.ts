export interface Order {
  _id: string
  orderNumber: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }>
  shippingInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode?: string
    notes?: string
  }
  paymentMethod: "cash" | "transfer"
  subtotal: number
  shippingCost: number
  total: number
  status:
    | "pending_manual"
    | "pending_transfer_proof"
    | "pending_transfer_confirmation"
    | "paid"
    | "cancelled"
    | "refunded"
  notes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  transferProofUrl?: string
}
