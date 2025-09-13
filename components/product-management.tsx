"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Eye, Filter, Download } from "lucide-react"
import { ProductDetails } from "@/components/product-details"
import { getProducts, deleteProduct } from "@/lib/actions/server-actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OptimizedImage } from "./optimized-image"

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_stock":
      return "bg-green-100 text-green-800"
    case "out_of_stock":
      return "bg-red-100 text-red-800"
    case "low_stock":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function ProductManagement() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingProduct, setViewingProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(id)
      if (result.success) {
        loadProducts()
      } else {
        alert(result.error || "Failed to delete product")
      }
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e94491]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="border-[#e94491] text-[#e94491] hover:bg-[#e94491] hover:text-white bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/products/add">
            <Button className="bg-[#e94491] hover:bg-[#d63384] w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Variants</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.variants?.[0]?.image_url ? (
                             <OptimizedImage
                             src={product.variants[0].image_url || "/placeholder.svg"}
                             alt={product.name}
                             width={48}
                             height={48}
                             className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                             sizes="48px"
                             quality={75}
                           />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{product.name}</div>
                          {product.top_price && (
                            <Badge className="bg-[#f472b6] text-white text-xs mt-1">Top Product</Badge>
                          )}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {product.category?.name || "No Category"} • {product.variants?.length || 0} variants
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {product.category?.name || "No Category"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{product.variants?.length || 0} variants</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`font-medium ${
                          product.totalStock === 0
                            ? "text-red-600"
                            : product.totalStock < 20
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {product.totalStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>{product.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setViewingProduct(product)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
                            <DialogHeader>
                              <DialogTitle>Product Details</DialogTitle>
                            </DialogHeader>
                            {viewingProduct && <ProductDetails product={viewingProduct} />}
                          </DialogContent>
                        </Dialog>
                        <Link href={`/products/edit/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
