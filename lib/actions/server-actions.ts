"use server"

import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

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
    // Get all categories with their children
    const allCategories = await prisma.category.findMany({
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Filter to get only parent categories (those with parentId === null)
    const parentCategories = allCategories.filter(cat => cat.parentId === null)
    
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
    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      return { success: false, error: "Slug already exists" }
    }

    // If parentId is provided, verify it exists
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
    // Check if slug already exists (excluding current category)
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return { success: false, error: "Slug already exists" }
    }

    // If parentId is provided, verify it exists and prevent circular reference
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

      // Check for circular reference (if the parentId is a child of current category)
      const children = await prisma.category.findMany({
        where: { parentId: id }
      })
      
      if (children.some(child => child.id === parentId)) {
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
    // Check if category has children
    const children = await prisma.category.findMany({
      where: { parentId: id }
    })

    if (children.length > 0) {
      return { success: false, error: "Cannot delete category with subcategories. Delete subcategories first." }
    }

    // Check if category is used by products
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

// Rest of your existing actions remain the same...

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

// Product Actions
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
            productSizeStocks: {
              include: {
                size: true,
              },
            },
          },
        },
      },
    })

    // Transform to match your existing structure
    const productsWithVariants = result.map((product: any) => {
      const variants = product.productColors.map((productColor: any) => ({
        id: productColor.id,
        color_id: productColor.color_id,
        image_url: productColor.image_url,
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

    // Transform to match your existing structure
    const variants = result.productColors.map((productColor: any) => ({
      id: productColor.id,
      color_id: productColor.color_id,
      image_url: productColor.image_url,
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
    sizes: Array<{
      size_id: string
      stock: number
      price: number
    }>
  }>
}): Promise<{ success: boolean; product?: any; error?: string }> => {
  try {
    // Create product with colors and sizes in a transaction
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
            image_url: colorData.image_url,
          },
        })

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

      // Delete existing product colors and their size stocks
      await tx.productSizeStock.deleteMany({
        where: {
          productColor: {
            product_id: id,
          },
        },
      })

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
            image_url: colorData.image_url,
          },
        })

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

// Order Actions
export const getOrders = async () => {
  try {
    const result = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            productSizeStock: {
              include: {
                productColor: {
                  include: {
                    product: true,
                    color: true,
                  },
                },
                size: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Transform to match your existing structure
    const ordersWithItems = result.map((order: any) => {
      const items = order.orderItems.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
        product: {
          id: item.productSizeStock.productColor.product.id,
          name: item.productSizeStock.productColor.product.name,
        },
        color: {
          id: item.productSizeStock.productColor.color.id,
          name: item.productSizeStock.productColor.color.name,
          hex: item.productSizeStock.productColor.color.hex,
        },
        size: {
          id: item.productSizeStock.size.id,
          label: item.productSizeStock.size.label,
        },
        image_url: item.productSizeStock.productColor.image_url,
      }))

      const total = items.reduce(
        (sum: any, item: any) => sum + Number.parseFloat(item.price_at_purchase.toString() || "0") * item.quantity,
        0,
      )

      return {
        id: order.id,
        guest_session_id: order.guest_session_id,
        ref_id: order.ref_id,
        name: order.name,
        phone: order.phone,
        address: order.address,
        status: order.status,
        created_at: order.created_at,
        items,
        total,
      }
    })

    return ordersWithItems
  } catch (error) {
    console.error("Get orders error:", error)
    return []
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "shipped" | "delivered" | "cancelled",
): Promise<{ success: boolean; error?: string }> => {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Update order status error:", error)
    return { success: false, error: "Failed to update order status" }
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
    // Get total products
    const totalProducts = await prisma.product.count()

    // Get total orders
    const totalOrders = await prisma.order.count()

    // Get total customers from GuestUser table
    const totalCustomers = await prisma.guestUser.count()

    // Calculate revenue from completed orders
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

    const revenue = completedOrders.reduce((total, order) => {
      const orderTotal = order.orderItems.reduce((orderSum, item) => {
        return orderSum + (Number(item.price_at_purchase) * item.quantity)
      }, 0)
      return total + orderTotal
    }, 0)

    // Get low stock items (stock < 10)
    const lowStockItems = await prisma.productSizeStock.count({
      where: { stock: { lt: 10 } }
    })

    // Get pending orders
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
    // Get recent orders (last 10)
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

    // Get recently updated products (last 5)
    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { updated_at: 'desc' },
      where: {
        updated_at: {
          lte: new Date()
        }
      }
    })

    // Get low stock alerts
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

    // Add recent orders
    recentOrders.forEach(order => {
      const productName = order.orderItems[0]?.productSizeStock?.productColor?.product?.name || 'Unknown Product'
      activities.push({
        type: 'order',
        title: 'New order received',
        description: `Order #${order.ref_id} from ${order.name}`,
        time: order.created_at,
        icon: 'ShoppingCart'
      })
    })

    // Add recent product updates
    recentProducts.forEach(product => {
      activities.push({
        type: 'product',
        title: 'Product updated',
        description: product.name,
        time: product.updated_at,
        icon: 'Package'
      })
    })

    // Add low stock alerts
    lowStockAlerts.forEach(stockItem => {
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

    // Sort by time and return latest 6
    return activities
      .sort((a:any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)

  } catch (error) {
    console.error("Get recent activity error:", error)
    return []
  }
}
