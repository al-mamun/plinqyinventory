export const demoStores = [
  {
    id: 1,
    name: 'Tech Haven',
    description: 'Your one-stop shop for all electronics and gadgets',
    address: 'Shaheb Bazar, Rajshahi',
    phone: '+880 1711-123456',
    latitude: 24.3745,
    longitude: 88.6042,
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Fashion Hub',
    description: 'Trendy clothing and accessories for everyone',
    address: 'Ghoramara, Rajshahi',
    phone: '+880 1711-234567',
    latitude: 24.3689,
    longitude: 88.6123,
    rating: 4.2,
  },
  {
    id: 3,
    name: 'Home & Garden Store',
    description: 'Everything you need for your home and garden',
    address: 'Kazla, Rajshahi',
    phone: '+880 1711-345678',
    latitude: 24.3812,
    longitude: 88.5987,
    rating: 4.7,
  },
]

export const demoProducts = [
  {
    id: 1,
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health tracking and GPS',
    price: 299.99,
    stock: 15,
    storeId: 1,
    storeName: 'Tech Haven',
  },
  {
    id: 2,
    name: 'Wireless Earbuds',
    description: 'Premium sound quality with active noise cancellation',
    price: 149.99,
    stock: 25,
    storeId: 1,
    storeName: 'Tech Haven',
  },
  {
    id: 3,
    name: 'Designer Jeans',
    description: 'Comfortable and stylish denim jeans',
    price: 79.99,
    stock: 30,
    storeId: 2,
    storeName: 'Fashion Hub',
  },
  {
    id: 4,
    name: 'Leather Jacket',
    description: 'Genuine leather jacket with premium finish',
    price: 249.99,
    stock: 12,
    storeId: 2,
    storeName: 'Fashion Hub',
  },
  {
    id: 5,
    name: 'Garden Tool Set',
    description: 'Complete set of essential gardening tools',
    price: 89.99,
    stock: 20,
    storeId: 3,
    storeName: 'Home & Garden Store',
  },
  {
    id: 6,
    name: 'LED Table Lamp',
    description: 'Modern LED lamp with adjustable brightness',
    price: 45.99,
    stock: 40,
    storeId: 3,
    storeName: 'Home & Garden Store',
  },
]

export const searchDemo = (query: string) => {
  const lowerQuery = query.toLowerCase()
  const results: { 
    id: number
    name: string
    description: string
    price?: number
    storeName: string
    storeId: number
    type: "product" | "store"
    address?: string
    phone?: string
    latitude?: number
    longitude?: number
    rating?: number
  }[] = []

  // Search products
  demoProducts.forEach((product) => {
    if (
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        storeName: product.storeName,
        storeId: product.storeId,
        type: 'product' as const,
      })
    }
  })

  // Search stores
  demoStores.forEach((store) => {
    if (
      store.name.toLowerCase().includes(lowerQuery) ||
      store.description.toLowerCase().includes(lowerQuery)
    ) {
      results.push({
        id: store.id,
        name: store.name,
        description: store.description,
        address: store.address,
        phone: store.phone,
        latitude: store.latitude,
        longitude: store.longitude,
        rating: store.rating,
        storeName: store.name,
        storeId: store.id,
        type: 'store' as const,
      })
    }
  })

  // Also include stores that have matching products
  const matchingProductStoreIds = new Set(
    demoProducts
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
      .map(p => p.storeId)
  )

  matchingProductStoreIds.forEach(storeId => {
    // Only add if not already in results
    if (!results.find(r => r.type === 'store' && r.id === storeId)) {
      const store = demoStores.find(s => s.id === storeId)
      if (store) {
        results.push({
          id: store.id,
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          latitude: store.latitude,
          longitude: store.longitude,
          rating: store.rating,
          storeName: store.name,
          storeId: store.id,
          type: 'store' as const,
        })
      }
    }
  })

  return results
}
