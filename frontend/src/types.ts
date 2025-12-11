export type Product = {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  stock?: number
}

export type CartItem = {
  id: number
  product: Product
  quantity: number
}

export type Order = {
  id: number
  createdAt: string
  totalPrice: number
  status: string
}
