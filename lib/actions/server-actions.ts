//service-action.ts
"use server"

import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { any } from "zod"

const prisma = new PrismaClient()

// Types
export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: Category | null
  children?: Category[]
}

export interface Color {
  id: string
  name: string
  hex: string | null
}

export interface Size {
  id: string
  label: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  solde_percentage: number | null
  top_price: boolean
  created_at: Date
  updated_at: Date
}

interface OrderItem {
  id: string
  quantity: number
  price_at_purchase: string
  product: {
    name: string
  }
  color: {
    name: string
  }
  size: {
    label: string
  }
  image_urls?: string[]
  image_url?: string
}

interface Order {
  id: string
  ref_id: string
  name: string
  phone: string
  city: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  created_at: string
  shipping_cost: string
  shipping_option?: string
  total: number
  items: OrderItem[]
}

export const getCurrentUser = async () => {
  return await auth()
}

// Category Actions
export const getCategories = async (): Promise<Category[]> => {
  try {
    const result = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    })
    return result
  } catch (error) {
    console.error("Get categories error:", error)
    return []
  }
}

export const getCategoriesHierarchy = async (): Promise<Category[]> => {
  try {
    const allCategories = await prisma.category.findMany({
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    const parentCategories = allCategories.filter((cat: any) => cat.parentId === null)
    return parentCategories
  } catch (error) {
    console.error("Get categories hierarchy error:", error)
    return []
  }
}

export const createCategory = async (
  name: string,
  slug: string,
  parentId?: string | null,
): Promise<{ success: boolean; category?: Category; error?: string }> => {
  try {
    const existing = await prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      return { success: false, error: "Slug already exists" }
    }

    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId }
      })

      if (!parentExists) {
        return { success: false, error: "Parent category not found" }
      }
    }

    const result = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true,
      }
    })

    revalidatePath("/")
    return { success: true, category: result }
  } catch (error) {
    console.error("Create category error:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export const updateCategory = async (
  id: string,
  name: string,
  slug: string,
  parentId?: string | null,
): Promise<{ success: boolean; category?: Category; error?: string }> => {
  try {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return { success: false, error: "Slug already exists" }
    }

    if (parentId) {
      if (parentId === id) {
        return { success: false, error: "Category cannot be its own parent" }
      }

      const parentExists = await prisma.category.findUnique({
        where: { id: parentId }
      })

      if (!parentExists) {
        return { success: false, error: "Parent category not found" }
      }

      const children = await prisma.category.findMany({
        where: { parentId: id }
      })

      if (children.some((child: any) => child.id === parentId)) {
        return { success: false, error: "Cannot create circular reference" }
      }
    }

    const result = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true,
      }
    })

    revalidatePath("/")
    return { success: true, category: result }
  } catch (error) {
    console.error("Update category error:", error)
    return { success: false, error: "Failed to update category" }
  }
}

export const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const children = await prisma.category.findMany({
      where: { parentId: id }
    })

    if (children.length > 0) {
      return { success: false, error: "Cannot delete category with subcategories. Delete subcategories first." }
    }

    const productsCount = await prisma.product.count({
      where: { category_id: id }
    })

    if (productsCount > 0) {
      return { success: false, error: "Cannot delete category that is used by products" }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete category error:", error)
    return { success: false, error: "Failed to delete category" }
  }
}

// Color Actions
export const getColors = async (): Promise<Color[]> => {
  try {
    const result = await prisma.color.findMany()
    return result
  } catch (error) {
    console.error("Get colors error:", error)
    return []
  }
}

export const createColor = async (
  name: string,
  hex: string,
): Promise<{ success: boolean; color?: Color; error?: string }> => {
  try {
    const result = await prisma.color.create({
      data: { name, hex },
    })

    revalidatePath("/")
    return { success: true, color: result }
  } catch (error) {
    console.error("Create color error:", error)
    return { success: false, error: "Failed to create color" }
  }
}

// Size Actions
export const getSizes = async (): Promise<Size[]> => {
  try {
    const result = await prisma.size.findMany()
    return result
  } catch (error) {
    console.error("Get sizes error:", error)
    return []
  }
}

export const createSize = async (label: string): Promise<{ success: boolean; size?: Size; error?: string }> => {
  try {
    const result = await prisma.size.create({
      data: { label },
    })

    revalidatePath("/")
    return { success: true, size: result }
  } catch (error) {
    console.error("Create size error:", error)
    return { success: false, error: "Failed to create size" }
  }
}

// Product Actions with Multiple Image Support
export const getProducts = async () => {
  try {
    const result = await prisma.product.findMany({
      include: {
        category: {
          include: {
            parent: true
          }
        },
        productColors: {
          include: {
            color: true,
            product_images: {
              orderBy: { sort_order: 'asc' }
            },
            productSizeStocks: {
              include: {
                size: true,
              },
            },
          },
        },
      },
    })

    const productsWithVariants = result.map((product: any) => {
      const variants = product.productColors.map((productColor: any) => ({
        id: productColor.id,
        color_id: productColor.color_id,
        image_url: productColor.image_url, // Keep for backward compatibility
        image_urls: productColor.product_images.map((img: any) => img.image_url), // Multiple images
        color: productColor.color,
        sizeStocks: productColor.productSizeStocks.map((sizeStock: any) => ({
          id: sizeStock.id,
          size_id: sizeStock.size_id,
          stock: sizeStock.stock,
          price: sizeStock.price,
          size: sizeStock.size,
        })),
      }))

      const totalStock = variants.reduce(
        (total: any, variant: any) =>
          total + variant.sizeStocks.reduce((variantTotal: any, ss: any) => variantTotal + (ss.stock || 0), 0),
        0,
      )

      return {
        ...product,
        variants,
        totalStock,
        status: totalStock === 0 ? "out_of_stock" : totalStock < 20 ? "low_stock" : "in_stock",
      }
    })

    return productsWithVariants
  } catch (error) {
    console.error("Get products error:", error)
    return []
  }
}

export const getProductById = async (id: string) => {
  try {
    const result = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        productColors: {
          include: {
            color: true,
            product_images: {
              orderBy: { sort_order: 'asc' }
            },
            productSizeStocks: {
              include: {
                size: true,
              },
            },
          },
        },
      },
    })

    if (!result) return null

    const variants = result.productColors.map((productColor: any) => ({
      id: productColor.id,
      color_id: productColor.color_id,
      image_url: productColor.image_url, // Keep for backward compatibility
      image_urls: productColor.product_images.map((img: any) => img.image_url), // Multiple images
      color: productColor.color,
      sizeStocks: productColor.productSizeStocks.map((sizeStock: any) => ({
        id: sizeStock.id,
        size_id: sizeStock.size_id,
        stock: sizeStock.stock,
        price: sizeStock.price,
        size: sizeStock.size,
      })),
    }))

    const totalStock = variants.reduce(
      (total: any, variant: any) =>
        total + variant.sizeStocks.reduce((variantTotal: any, ss: any) => variantTotal + (ss.stock || 0), 0),
      0,
    )

    return {
      ...result,
      variants,
      totalStock,
      status: totalStock === 0 ? "out_of_stock" : totalStock < 20 ? "low_stock" : "in_stock",
    }
  } catch (error) {
    console.error("Get product by ID error:", error)
    return null
  }
}

export const createProduct = async (productData: {
  name: string
  description: string
  category_id: string
  solde_percentage?: number
  top_price: boolean
  colors: Array<{
    color_id: string
    image_url: string
    image_urls?: string[] // Support for multiple images
    sizes: Array<{
      size_id: string
      stock: number
      price: number
    }>
  }>
}): Promise<{ success: boolean; product?: any; error?: string }> => {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          solde_percentage: productData.solde_percentage,
          top_price: productData.top_price,
        },
      })

      // Create colors and size stocks
      for (const colorData of productData.colors) {
        // Skip if color_id is temporary
        if (colorData.color_id.startsWith("custom-") || colorData.color_id.startsWith("temp-")) {
          continue
        }

        const productColor = await tx.productColor.create({
          data: {
            product_id: newProduct.id,
            color_id: colorData.color_id,
            image_url: colorData.image_url || "", // Keep for backward compatibility
          },
        })

        // Handle multiple images if provided
        if (colorData.image_urls && colorData.image_urls.length > 0) {
          for (let i = 0; i < colorData.image_urls.length; i++) {
            const imageUrl = colorData.image_urls[i]
            if (imageUrl && imageUrl.trim()) {
              await tx.productImage.create({
                data: {
                  product_color_id: productColor.id,
                  image_url: imageUrl,
                  is_primary: i === 0, // First image is primary
                  sort_order: i,
                },
              })
            }
          }
        }

        // Create size stocks
        for (const sizeData of colorData.sizes) {
          // Skip if size_id is temporary
          if (sizeData.size_id.startsWith("custom-") || sizeData.size_id.startsWith("temp-")) {
            continue
          }

          await tx.productSizeStock.create({
            data: {
              product_color_id: productColor.id,
              size_id: sizeData.size_id,
              stock: sizeData.stock,
              price: sizeData.price,
            },
          })
        }
      }

      return newProduct
    })

    revalidatePath("/")
    return { success: true, product: result }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export const updateProduct = async (
  id: string,
  productData: {
    name: string
    description: string
    category_id: string
    solde_percentage?: number
    top_price: boolean
    colors: Array<{
      color_id: string
      image_url: string
      image_urls?: string[] // Support for multiple images
      sizes: Array<{
        size_id: string
        stock: number
        price: number
      }>
    }>
  },
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Update basic product information
      await tx.product.update({
        where: { id },
        data: {
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          solde_percentage: productData.solde_percentage,
          top_price: productData.top_price,
          updated_at: new Date(),
        },
      })

      // Get existing product colors to clean up images
      const existingProductColors = await tx.productColor.findMany({
        where: { product_id: id },
        include: {
          product_images: true,
          productSizeStocks: true
        }
      })

      // Delete existing product images - Fixed the model name
      for (const productColor of existingProductColors) {
        await tx.product_images.deleteMany({
          where: { product_color_id: productColor.id }
        })
      }

      // Delete existing product size stocks
      await tx.productSizeStock.deleteMany({
        where: {
          productColor: {
            product_id: id,
          },
        },
      })

      // Delete existing product colors
      await tx.productColor.deleteMany({
        where: { product_id: id },
      })

      // Create new colors and size stocks
      for (const colorData of productData.colors) {
        // Skip if color_id is temporary
        if (colorData.color_id.startsWith("custom-") || colorData.color_id.startsWith("temp-")) {
          continue
        }

        const productColor = await tx.productColor.create({
          data: {
            product_id: id,
            color_id: colorData.color_id,
            image_url: colorData.image_url || "", // Keep for backward compatibility
          },
        })

        // Handle multiple images if provided
        if (colorData.image_urls && colorData.image_urls.length > 0) {
          for (let i = 0; i < colorData.image_urls.length; i++) {
            const imageUrl = colorData.image_urls[i]
            if (imageUrl && imageUrl.trim()) {
              await tx.product_images.create({
                data: {
                  id: crypto.randomUUID(), // Add explicit ID generation
                  product_color_id: productColor.id,
                  image_url: imageUrl,
                  is_primary: i === 0, // First image is primary
                  sort_order: i,
                },
              })
            }
          }
        }

        // Create size stocks
        for (const sizeData of colorData.sizes) {
          // Skip if size_id is temporary
          if (sizeData.size_id.startsWith("custom-") || sizeData.size_id.startsWith("temp-")) {
            continue
          }

          await tx.productSizeStock.create({
            data: {
              product_color_id: productColor.id,
              size_id: sizeData.size_id,
              stock: sizeData.stock,
              price: sizeData.price,
            },
          })
        }
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete product error:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

// Image Management Actions
export const updateProductImages = async (
  productColorId: string,
  imageUrls: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Delete existing images for this product color
      await tx.productImage.deleteMany({
        where: { product_color_id: productColorId }
      })

      // Create new images
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i]
        if (imageUrl && imageUrl.trim()) {
          await tx.productImage.create({
            data: {
              product_color_id: productColorId,
              image_url: imageUrl,
              is_primary: i === 0, // First image is primary
              sort_order: i,
            },
          })
        }
      }

      // Update the main image_url in productColor for backward compatibility
      await tx.productColor.update({
        where: { id: productColorId },
        data: {
          image_url: imageUrls.length > 0 ? imageUrls[0] : null
        }
      })
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update product images error:", error)
    return { success: false, error: "Failed to update product images" }
  }
}

export const deleteProductImage = async (
  productImageId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.product_images.delete({
      where: { id: productImageId }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete product image error:", error)
    return { success: false, error: "Failed to delete product image" }
  }
}

export const reorderProductImages = async (
  productColorId: string,
  imageOrders: Array<{ id: string; sort_order: number }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.$transaction(async (tx: any) => {
      for (const imageOrder of imageOrders) {
        await tx.productImage.update({
          where: { id: imageOrder.id },
          data: {
            sort_order: imageOrder.sort_order,
            is_primary: imageOrder.sort_order === 0 // First image is primary
          }
        })
      }

      // Update the main image_url in productColor for backward compatibility
      const primaryImage = await tx.productImage.findFirst({
        where: {
          product_color_id: productColorId,
          is_primary: true
        }
      })

      if (primaryImage) {
        await tx.productColor.update({
          where: { id: productColorId },
          data: { image_url: primaryImage.image_url }
        })
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Reorder product images error:", error)
    return { success: false, error: "Failed to reorder product images" }
  }
}

// Utility functions
export const updateStock = async (
  productSizeStockId: string,
  newStock: number,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.productSizeStock.update({
      where: { id: productSizeStockId },
      data: { stock: newStock },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update stock error:", error)
    return { success: false, error: "Failed to update stock" }
  }
}

// Dashboard Statistics Actions
export const getDashboardStats = async () => {
  try {
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()
    const totalCustomers = await prisma.guestUser.count()

    const completedOrders = await prisma.order.findMany({
      where: { status: 'delivered' },
      include: {
        orderItems: {
          include: {
            productSizeStock: true
          }
        }
      }
    })

    const revenue = completedOrders.reduce((total: any, order: any) => {
      const orderTotal = order.orderItems.reduce((orderSum: any, item: any) => {
        return orderSum + (Number(item.price_at_purchase) * item.quantity)
      }, 0)
      return total + orderTotal
    }, 0)

    const lowStockItems = await prisma.productSizeStock.count({
      where: { stock: { lt: 10 } }
    })

    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' }
    })

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      revenue,
      lowStockItems,
      pendingOrders
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      revenue: 0,
      lowStockItems: 0,
      pendingOrders: 0
    }
  }
}

export const getRecentActivity = async () => {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        orderItems: {
          take: 1,
          include: {
            productSizeStock: {
              include: {
                productColor: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { updated_at: 'desc' },
      where: {
        updated_at: {
          lte: new Date()
        }
      }
    })

    const lowStockAlerts = await prisma.productSizeStock.findMany({
      where: { stock: { lt: 5 } },
      take: 2,
      include: {
        productColor: {
          include: {
            product: true
          }
        },
        size: true
      }
    })

    const activities: any = []

    recentOrders.forEach((order: any) => {
      const productName = order.orderItems[0]?.productSizeStock?.productColor?.product?.name || 'Unknown Product'
      activities.push({
        type: 'order',
        title: 'New order received',
        description: `Order #${order.ref_id} from ${order.name}`,
        time: order.created_at,
        icon: 'ShoppingCart'
      })
    })

    recentProducts.forEach((product: any) => {
      activities.push({
        type: 'product',
        title: 'Product updated',
        description: product.name,
        time: product.updated_at,
        icon: 'Package'
      })
    })

    lowStockAlerts.forEach((stockItem: any) => {
      const productName = stockItem.productColor?.product?.name || 'Unknown Product'
      const sizeName = stockItem.size?.label || 'Unknown Size'
      activities.push({
        type: 'alert',
        title: 'Low stock alert',
        description: `${productName} - Size ${sizeName} running low (${stockItem.stock} left)`,
        time: new Date(),
        icon: 'AlertTriangle'
      })
    })

    return activities
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)

  } catch (error) {
    console.error("Get recent activity error:", error)
    return []
  }
}

// Additional utility functions for multiple image support
export const getProductImages = async (productColorId: string) => {
  try {
    const images = await prisma.product_images.findMany({
      where: { product_color_id: productColorId },
      orderBy: { sort_order: 'asc' }
    })
    return images
  } catch (error) {
    console.error("Get product images error:", error)
    return []
  }
}

export const setPrimaryImage = async (
  productImageId: string,
  productColorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.$transaction(async (tx: any) => {
      // Remove primary flag from all images in this product color
      await tx.productImage.updateMany({
        where: { product_color_id: productColorId },
        data: { is_primary: false }
      })

      // Set the selected image as primary
      await tx.productImage.update({
        where: { id: productImageId },
        data: { is_primary: true, sort_order: 0 }
      })

      // Update main image_url for backward compatibility
      const primaryImage = await tx.productImage.findUnique({
        where: { id: productImageId }
      })

      if (primaryImage) {
        await tx.productColor.update({
          where: { id: productColorId },
          data: { image_url: primaryImage.image_url }
        })
      }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Set primary image error:", error)
    return { success: false, error: "Failed to set primary image" }
  }
}

// Fixed getOrders function for your server-actions.ts
export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            productSizeStock: {
              include: {
                productColor: {
                  include: {
                    product: true,
                    color: true,
                    product_images: {
                      orderBy: { sort_order: 'asc' } // Ensure proper ordering
                    },
                  },
                },
                size: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    return orders.map((order: any) => {
      const items: OrderItem[] = order.orderItems.map((item: any) => {
        // Get all images for this product color
        const productImages = item.productSizeStock.productColor.product_images || []
        
        // Create image URLs array from product_images
        const imageUrls = productImages.map((img: any) => img.image_url).filter(Boolean)
        
        // Fallback to productColor image_url if no product_images
        const fallbackImageUrl = item.productSizeStock.productColor.image_url
        
        // Final image URLs array with fallbacks
        const finalImageUrls = imageUrls.length > 0 ? imageUrls : (fallbackImageUrl ? [fallbackImageUrl] : [])

        return {
          id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase.toString(),
          product: { name: item.productSizeStock.productColor.product.name },
          color: { name: item.productSizeStock.productColor.color.name },
          size: { label: item.productSizeStock.size.label },
          image_urls: finalImageUrls, // This is the key fix
          image_url: finalImageUrls[0] || "/placeholder.svg?height=64&width=64", // First image or placeholder
        }
      })

      const itemsTotal = items.reduce((sum, item) => sum + Number.parseFloat(item.price_at_purchase) * item.quantity, 0)
      const shippingCost = Number.parseFloat(order.shipping_cost.toString())
      const total = itemsTotal + shippingCost

      return {
        id: order.id,
        ref_id: order.ref_id,
        name: order.name,
        phone: order.phone,
        city: order.city,
        status: order.status as Order["status"],
        created_at: order.created_at.toISOString(),
        shipping_cost: order.shipping_cost.toString(),
        shipping_option: order.shipping_option || undefined,
        total,
        items,
      }
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        confirmed_at: newStatus === "confirmed" ? new Date() : undefined,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: "Failed to update order status" }
  }
}

export async function approveOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    await prisma.$transaction(async (tx: any) => {
      // Update stock levels
      for (const item of order.orderItems) {
        await tx.productSizeStock.update({
          where: { id: item.product_size_stock_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
            reserved_stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "confirmed",
          stock_reduced: true,
          confirmed_at: new Date(),
        },
      })
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error approving order:", error)
    return { success: false, error: "Failed to approve order" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId },
    })

    
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting order:", error)
    return { success: false, error: "Failed to delete order" }
  }
}

// Updated function for creating orders (to be used in landing page)
export const createOrder = async (orderData: {
  guest_session_id: string
  name: string
  phone: string
  city: string
  shipping_cost: number
  shipping_option?: string
  items: Array<{
    product_size_stock_id: string
    quantity: number
    price_at_purchase: number
  }>
}): Promise<{ success: boolean; order?: any; error?: string }> => {
  try {
    // Generate unique reference ID
    const refId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Check stock availability before creating order
    for (const item of orderData.items) {
      const sizeStock = await prisma.productSizeStock.findUnique({
        where: { id: item.product_size_stock_id }
      })

      if (!sizeStock) {
        return { success: false, error: "Product variant not found" }
      }

      const availableStock = sizeStock.stock - sizeStock.reserved_stock
      if (availableStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock. Available: ${availableStock}, Required: ${item.quantity}`
        }
      }
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          guest_session_id: orderData.guest_session_id,
          ref_id: refId,
          name: orderData.name,
          phone: orderData.phone,
          city: orderData.city,
          shipping_cost: orderData.shipping_cost,
          shipping_option: orderData.shipping_option,
          status: "pending",
          stock_reserved: true, // Mark as reserved
          stock_reduced: false  // Not reduced yet
        }
      })

      // Create order items and reserve stock
      for (const item of orderData.items) {
        await tx.orderItem.create({
          data: {
            order_id: newOrder.id,
            product_size_stock_id: item.product_size_stock_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
          }
        })

        // Reserve stock (don't reduce actual stock yet)
        await tx.productSizeStock.update({
          where: { id: item.product_size_stock_id },
          data: {
            reserved_stock: {
              increment: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    revalidatePath("/")
    return { success: true, order: result }
  } catch (error) {
    console.error("Create order error:", error)
    return { success: false, error: "Failed to create order" }
  }
}

// Get available stock (actual stock minus reserved stock)
export const getAvailableStock = async (productSizeStockId: string): Promise<number> => {
  try {
    const sizeStock = await prisma.productSizeStock.findUnique({
      where: { id: productSizeStockId }
    })

    if (!sizeStock) return 0

    return Math.max(0, sizeStock.stock - sizeStock.reserved_stock)
  } catch (error) {
    console.error("Get available stock error:", error)
    return 0
  }
}

// Updated utility function to show actual vs available stock
export const getStockInfo = async (productSizeStockId: string) => {
  try {
    const sizeStock = await prisma.productSizeStock.findUnique({
      where: { id: productSizeStockId }
    })

    if (!sizeStock) return null

    return {
      actualStock: sizeStock.stock,
      reservedStock: sizeStock.reserved_stock,
      availableStock: Math.max(0, sizeStock.stock - sizeStock.reserved_stock)
    }
  } catch (error) {
    console.error("Get stock info error:", error)
    return null
  }
}