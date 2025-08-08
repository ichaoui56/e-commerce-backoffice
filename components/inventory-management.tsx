"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, AlertTriangle, Package } from 'lucide-react'
import { getProducts, updateStock } from "@/lib/actions/server-actions"

interface StockUpdateDialogProps {
  item: any
  onClose: () => void
  onSuccess: () => void
}

function StockUpdateDialog({ item, onClose, onSuccess }: StockUpdateDialogProps) {
  const [newStock, setNewStock] = useState(item.stock.toString())
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateStock(item.id, Number(newStock))
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || "Failed to update stock")
      }
    } catch (error) {
      alert("An error occurred while updating stock")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-mobile">
      <div>
        <Label htmlFor="stock" className="text-sm font-medium">New Stock Quantity</Label>
        <Input
          id="stock"
          type="number"
          min="0"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Enter new stock quantity"
          className="mt-1"
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="bg-[#e94491] hover:bg-[#d63384] flex-1 sm:flex-none"
        >
          {isLoading ? "Updating..." : "Update Stock"}
        </Button>
      </div>
    </form>
  )
}

export function InventoryManagement() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Flatten products into inventory items
  const inventoryItems = products.flatMap(
    (product) =>
      product.variants?.flatMap(
        (variant: any) =>
          variant.sizeStocks?.map((sizeStock: any) => ({
            id: sizeStock.id,
            productName: product.name,
            colorName: variant.color?.name || "Unknown",
            sizeName: sizeStock.size?.label || "Unknown",
            stock: sizeStock.stock || 0,
            price: Number(sizeStock.price) || 0,
            image_url: variant.image_url,
            category: product.category?.name || "No Category",
          })) || [],
      ) || [],
  )

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sizeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockItems = filteredItems.filter((item) => item.stock < 10)
  const outOfStockItems = filteredItems.filter((item) => item.stock === 0)

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {outOfStockItems.length} Out of Stock
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {lowStockItems.length} Low Stock
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{filteredItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {filteredItems.filter((item) => item.stock > 10).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Inventory Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Color</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[150px] sm:max-w-none">{item.productName}</div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {item.category} • {item.colorName} • {item.sizeName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                        <span className="text-sm">{item.colorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{item.sizeName}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          item.stock === 0 
                            ? "text-red-600" 
                            : item.stock < 10 
                            ? "text-yellow-600" 
                            : "text-green-600"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.stock === 0
                            ? "bg-red-100 text-red-800"
                            : item.stock < 10
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {item.stock === 0 ? "Out" : item.stock < 10 ? "Low" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md mx-4">
                          <DialogHeader>
                            <DialogTitle>Update Stock</DialogTitle>
                          </DialogHeader>
                          <StockUpdateDialog
                            item={editingItem}
                            onClose={() => setEditingItem(null)}
                            onSuccess={loadInventory}
                          />
                        </DialogContent>
                      </Dialog>
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
