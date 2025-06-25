"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  size: string
  color?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  removeFromCart: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  getTotalPrice: () => number
  getTotalItems: () => number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    const itemKey = `${product.id}-${product.size}-${product.color || ""}`
    const existingItem = items.find((item) => `${item.id}-${item.size}-${item.color || ""}` === itemKey)

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + quantity, product.size, product.color)
    } else {
      setItems([...items, { ...product, quantity }])
    }
  }

  const removeFromCart = (id: string, size?: string, color?: string) => {
    const itemKey = `${id}-${size}-${color || ""}`
    setItems(items.filter((item) => `${item.id}-${item.size}-${item.color || ""}` !== itemKey))
  }

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color)
      return
    }

    const itemKey = `${id}-${size}-${color || ""}`
    setItems(
      items.map((item) =>
        `${item.id}-${item.size}-${item.color || ""}` === itemKey ? { ...item, quantity: quantity } : item,
      ),
    )
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart, // Make sure this is included
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

