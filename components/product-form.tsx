"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Plus, Trash2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/ImageUpload" // Import the new component
import {
  getCategories,
  getColors,
  getSizes,
  createProduct,
  updateProduct,
  createColor,
  createSize,
  type Category,
  type Color,
  type Size,
} from "@/lib/actions/server-actions"

interface ProductFormProps {
  product?: any
}

interface ColorSize {
  id: string
  label: string
  stock: number
  price: number
}

interface SelectedColor {
  id: string
  name: string
  hex: string
  image_urls: string[] // Changed from image_url to image_urls array
  sizes: ColorSize[]
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEditMode = Boolean(product?.id)

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    solde_percentage: product?.solde_percentage || "",
    top_price: product?.top_price || false,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [allColors, setAllColors] = useState<Color[]>([])
  const [allSizes, setAllSizes] = useState<Size[]>([])
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingCustomColor, setIsAddingCustomColor] = useState(false)
  const [customColorData, setCustomColorData] = useState({
    name: "",
    hex: "#000000",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        solde_percentage: product.solde_percentage || "",
        top_price: product.top_price || false,
      })
    }
  }, [product])

  const loadData = async () => {
    try {
      const [categoriesData, colorsData, sizesData] = await Promise.all([
        getCategories(), 
        getColors(), 
        getSizes()
      ])
      setCategories(categoriesData)
      setAllColors(colorsData)
      setAllSizes(sizesData)

      if (product?.variants) {
        const existingColors: SelectedColor[] = []
        product.variants.forEach((variant: any) => {
          const existingColor = existingColors.find((c) => c.id === variant.color_id)
          if (existingColor) {
            // Add image URL to existing color if not already present
            if (variant.image_url && !existingColor.image_urls.includes(variant.image_url)) {
              existingColor.image_urls.push(variant.image_url)
            }
            variant.sizeStocks.forEach((sizeStock: any) => {
              existingColor.sizes.push({
                id: sizeStock.size_id,
                label: sizeStock.size?.label || "",
                stock: sizeStock.stock,
                price: Number(sizeStock.price),
              })
            })
          } else {
            const colorSizes: ColorSize[] = variant.sizeStocks.map((sizeStock: any) => ({
              id: sizeStock.size_id,
              label: sizeStock.size?.label || "",
              stock: sizeStock.stock,
              price: Number(sizeStock.price),
            }))
            existingColors.push({
              id: variant.color_id,
              name: variant.color?.name || "",
              hex: variant.color?.hex || "",
              image_urls: variant.image_url ? [variant.image_url] : [], // Convert single URL to array
              sizes: colorSizes,
            })
          }
        })
        setSelectedColors(existingColors)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      alert("Failed to load form data")
    }
  }

  const handleColorAdd = (colorId: string) => {
    const color = allColors.find((c) => c.id === colorId)
    if (color && !selectedColors.find((c) => c.id === colorId)) {
      setSelectedColors((prev) => [...prev, {
        id: color.id,
        name: color.name,
        hex: color.hex || "#000000",
        image_urls: [], // Initialize with empty array
        sizes: [],
      }])
    }
  }

  const handleColorRemove = (colorId: string) => {
    setSelectedColors((prev) => prev.filter((c) => c.id !== colorId))
  }

  // New function to handle image changes from ImageUpload component
  const handleImagesChange = (colorId: string, imageUrls: string[]) => {
    setSelectedColors((prev) =>
      prev.map((color) => 
        color.id === colorId 
          ? { ...color, image_urls: imageUrls }
          : color
      )
    )
  }

  const addSizeToColor = (colorId: string, sizeId: string) => {
    const size = allSizes.find((s) => s.id === sizeId)
    if (!size) return

    setSelectedColors((prev) =>
      prev.map((color) => {
        if (color.id === colorId) {
          if (color.sizes.find((s) => s.id === sizeId)) {
            return color
          }
          return {
            ...color,
            sizes: [...color.sizes, {
              id: size.id,
              label: size.label,
              stock: 0,
              price: 0,
            }],
          }
        }
        return color
      }),
    )
  }

  const addCustomSizeToColor = async (colorId: string, customSize: string) => {
    if (!customSize.trim()) return

    try {
      const result = await createSize(customSize.trim())
      if (result.success && result.size) {
        setAllSizes((prev) => [...prev, result.size!])
        setSelectedColors((prev) =>
          prev.map((color) => {
            if (color.id === colorId) {
              if (color.sizes.find((s) => s.label === customSize.trim())) {
                return color
              }
              return {
                ...color,
                sizes: [...color.sizes, {
                  id: result.size!.id,
                  label: result.size!.label,
                  stock: 0,
                  price: 0,
                }],
              }
            }
            return color
          }),
        )
      } else {
        alert(result.error || "Failed to create size")
      }
    } catch (error) {
      console.error("Error creating size:", error)
      alert("Failed to create custom size")
    }
  }

  const removeSizeFromColor = (colorId: string, sizeId: string) => {
    setSelectedColors((prev) =>
      prev.map((color) => {
        if (color.id === colorId) {
          return {
            ...color,
            sizes: color.sizes.filter((s) => s.id !== sizeId),
          }
        }
        return color
      }),
    )
  }

  const updateColorSize = (colorId: string, sizeId: string, field: "stock" | "price", value: number) => {
    setSelectedColors((prev) =>
      prev.map((color) => {
        if (color.id === colorId) {
          return {
            ...color,
            sizes: color.sizes.map((size) => (size.id === sizeId ? { ...size, [field]: value } : size)),
          }
        }
        return color
      }),
    )
  }

  const handleCustomColorAdd = async () => {
    if (!customColorData.name.trim()) {
      alert("Please enter a color name")
      return
    }

    const existingColor = [...allColors, ...selectedColors].find(
      (c) => c.name.toLowerCase() === customColorData.name.toLowerCase(),
    )
    if (existingColor) {
      alert("A color with this name already exists")
      return
    }

    try {
      const result = await createColor(customColorData.name.trim(), customColorData.hex)
      if (result.success && result.color) {
        const newColor: SelectedColor = {
          id: result.color.id,
          name: result.color.name,
          hex: result.color.hex || "#000000",
          image_urls: [], // Initialize with empty array
          sizes: [],
        }
        setSelectedColors((prev) => [...prev, newColor])
        setAllColors((prev) => [...prev, result.color!])
        setCustomColorData({ name: "", hex: "#000000" })
        setIsAddingCustomColor(false)
      } else {
        alert(result.error || "Failed to create color")
      }
    } catch (error) {
      console.error("Error creating color:", error)
      alert("An error occurred while creating the color")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name || !formData.category_id || selectedColors.length === 0) {
        alert("Please fill in all required fields and select at least one color.")
        setIsLoading(false)
        return
      }

      const colorsWithoutSizes = selectedColors.filter((color) => color.sizes.length === 0)
      if (colorsWithoutSizes.length > 0) {
        alert(`Please add at least one size for: ${colorsWithoutSizes.map((c) => c.name).join(", ")}`)
        setIsLoading(false)
        return
      }

      // Transform data to work with multiple images
      const colorsData = selectedColors.flatMap((color) => 
        color.image_urls.length > 0 
          ? color.image_urls.map((imageUrl) => ({
              color_id: color.id,
              image_url: imageUrl,
              sizes: color.sizes.map((size) => ({
                size_id: size.id,
                stock: Number(size.stock) || 0,
                price: Number(size.price) || 0,
              })),
            }))
          : [{
              color_id: color.id,
              image_url: "",
              sizes: color.sizes.map((size) => ({
                size_id: size.id,
                stock: Number(size.stock) || 0,
                price: Number(size.price) || 0,
              })),
            }]
      )

      const productData = {
        ...formData,
        solde_percentage: formData.solde_percentage ? Number(formData.solde_percentage) : undefined,
        colors: colorsData,
      }

      let result
      if (isEditMode && product?.id) {
        result = await updateProduct(product.id, productData)
      } else {
        result = await createProduct(productData)
      }

      if (result.success) {
        router.push("/products")
      } else {
        alert(result.error || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("An error occurred while saving the product")
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalVariants = () => {
    return selectedColors.reduce((total, color) => total + color.sizes.length, 0)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-[#e94491] to-[#f472b6] p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {isEditMode ? "Edit Product" : "Create New Product"}
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              {isEditMode ? "Update your product information" : "Add a new product to your inventory"}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold">{getTotalVariants()}</div>
            <div className="text-sm text-white/80">Total Variants</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Basic Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">1</span>
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 form-mobile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  className="h-12 border-2 border-gray-200 focus:border-[#e94491] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                  Category *
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-[#e94491]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={4}
                className="border-2 border-gray-200 focus:border-[#e94491] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-semibold text-gray-700">
                  Discount (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.solde_percentage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, solde_percentage: e.target.value }))}
                  placeholder="0"
                  className="h-12 border-2 border-gray-200 focus:border-[#e94491] transition-colors"
                />
              </div>

              <div className="flex items-center space-x-3 pt-6 sm:pt-8">
                <Switch
                  id="top-product"
                  checked={formData.top_price}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, top_price: checked }))}
                  className="data-[state=checked]:bg-[#e94491] h-5"
                />
                <Label htmlFor="top-product" className="text-sm font-semibold text-gray-700">
                  Mark as Top Product
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Selection */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">2</span>
              </div>
              Colors & Variants *
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 form-mobile">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">Add Color</Label>
              
              {/* Existing Colors Dropdown */}
              <Select onValueChange={handleColorAdd}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-[#e94491]">
                  <SelectValue placeholder="Select from existing colors" />
                </SelectTrigger>
                <SelectContent>
                  {allColors
                    .filter((color) => !selectedColors.find((sc) => sc.id === color.id))
                    .map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: color.hex || "#000000" }}
                          />
                          <span className="font-medium">{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Custom Color Creation */}
              {!isAddingCustomColor ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingCustomColor(true)}
                  className="w-full h-12 border-2 border-dashed border-[#e94491] text-[#e94491] hover:bg-[#e94491]/10 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Custom Color
                </Button>
              ) : (
                <Card className="border-2 border-[#e94491] bg-gradient-to-r from-[#e94491]/5 to-[#f472b6]/5">
                  <CardContent className="p-4 sm:p-6 form-mobile">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base sm:text-lg font-semibold text-gray-800">Create New Color</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingCustomColor(false)
                          setCustomColorData({ name: "", hex: "#000000" })
                        }}
                        className="hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-color-name" className="text-sm font-semibold text-gray-700">
                          Color Name
                        </Label>
                        <Input
                          id="custom-color-name"
                          value={customColorData.name}
                          onChange={(e) => setCustomColorData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Forest Green, Navy Blue"
                          className="h-12 border-2 border-gray-200 focus:border-[#e94491]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-color-hex" className="text-sm font-semibold text-gray-700">
                          Color
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id="custom-color-hex"
                            type="color"
                            value={customColorData.hex}
                            onChange={(e) => setCustomColorData((prev) => ({ ...prev, hex: e.target.value }))}
                            className="w-16 h-12 p-1 border-2 border-gray-200 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={customColorData.hex}
                            onChange={(e) => setCustomColorData((prev) => ({ ...prev, hex: e.target.value }))}
                            placeholder="#000000"
                            className="flex-1 h-12 border-2 border-gray-200 focus:border-[#e94491]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border mt-4">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-lg"
                        style={{ backgroundColor: customColorData.hex }}
                      />
                      <div>
                        <div className="font-semibold text-gray-800">{customColorData.name || "Unnamed Color"}</div>
                        <div className="text-sm text-gray-500">{customColorData.hex}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button
                        type="button"
                        onClick={handleCustomColorAdd}
                        className="bg-[#e94491] hover:bg-[#d63384] flex-1 h-12"
                        disabled={!customColorData.name.trim()}
                      >
                        Add Color
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingCustomColor(false)
                          setCustomColorData({ name: "", hex: "#000000" })
                        }}
                        className="h-12 flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Selected Colors */}
            {selectedColors.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Label className="text-base sm:text-lg font-semibold text-gray-800">
                    Selected Colors ({selectedColors.length})
                  </Label>
                  <Badge className="bg-[#e94491] text-white px-4 py-2 text-sm font-semibold w-fit">
                    Total Variants: {getTotalVariants()}
                  </Badge>
                </div>

                <div className="space-y-6">
                  {selectedColors.map((color, index) => (
                    <Card
                      key={color.id}
                      className="border-l-8 shadow-lg bg-gradient-to-r from-white to-gray-50/50"
                      style={{ borderLeftColor: color.hex }}
                    >
                      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#e94491] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg sm:text-xl font-bold text-gray-800">{color.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {color.sizes.length} sizes, {color.image_urls.length} images
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleColorRemove(color.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-3 self-start sm:self-center"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 p-4 sm:p-6">
                        {/* Image Upload Component */}
                        <ImageUpload
                          colorId={color.id}
                          colorName={color.name}
                          existingImages={color.image_urls}
                          onImagesChange={handleImagesChange}
                          maxImages={5}
                        />

                        {/* Size Management */}
                        <div className="space-y-4">
                          <Label className="text-sm font-semibold text-gray-700">Size & Pricing for {color.name}</Label>
                          
                          {/* Add Size Options */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Select onValueChange={(sizeId) => addSizeToColor(color.id, sizeId)}>
                              <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 focus:border-[#e94491]">
                                <SelectValue placeholder="Add existing size" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSizes
                                  .filter((size) => !color.sizes.find((cs) => cs.id === size.id))
                                  .map((size) => (
                                    <SelectItem key={size.id} value={size.id}>
                                      {size.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            
                            <div className="flex gap-2">
                              <Input
                                placeholder="Custom size (e.g., 38, XS)"
                                className="w-full sm:w-48 h-12 border-2 border-gray-200 focus:border-[#e94491]"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    const input = e.target as HTMLInputElement
                                    addCustomSizeToColor(color.id, input.value)
                                    input.value = ""
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement
                                  if (input) {
                                    addCustomSizeToColor(color.id, input.value)
                                    input.value = ""
                                  }
                                }}
                                className="h-12 px-4 border-2 border-[#e94491] text-[#e94491] hover:bg-[#e94491] hover:text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Sizes Table */}
                          {color.sizes.length > 0 && (
                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              <div className="table-responsive">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50">
                                      <TableHead className="font-semibold text-gray-700 py-4">Size</TableHead>
                                      <TableHead className="font-semibold text-gray-700 py-4">Price (MAD)</TableHead>
                                      <TableHead className="font-semibold text-gray-700 py-4">Stock</TableHead>
                                      <TableHead className="font-semibold text-gray-700 py-4">Action</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {color.sizes.map((size) => (
                                      <TableRow key={size.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="py-4">
                                          <Badge
                                            variant="outline"
                                            className="font-semibold text-sm px-3 py-1 border-2"
                                            style={{ borderColor: color.hex, color: color.hex }}
                                          >
                                            {size.label}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={size.price}
                                            onChange={(e) =>
                                              updateColorSize(color.id, size.id, "price", Number(e.target.value))
                                            }
                                            className="w-full h-10 border-2 border-gray-200 focus:border-[#e94491]"
                                            placeholder="0.00"
                                          />
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <Input
                                            type="number"
                                            min="0"
                                            value={size.stock}
                                            onChange={(e) =>
                                              updateColorSize(color.id, size.id, "stock", Number(e.target.value))
                                            }
                                            className="w-full h-10 border-2 border-gray-200 focus:border-[#e94491]"
                                            placeholder="0"
                                          />
                                        </TableCell>
                                        <TableCell className="py-4">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSizeFromColor(color.id, size.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}

                          {color.sizes.length === 0 && (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                              <div className="text-lg font-semibold mb-2">No sizes added yet</div>
                              <div className="text-sm">Add sizes for {color.name} to create variants</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-2 flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t-2 border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/products")}
            className="h-12 px-6 sm:px-8 border-2 border-gray-300 hover:bg-gray-50 order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || selectedColors.length === 0 || getTotalVariants() === 0}
            className="bg-gradient-to-r from-[#e94491] to-[#f472b6] hover:from-[#d63384] to-[#e94491] h-12 px-6 sm:px-8 font-semibold shadow-lg disabled:opacity-50 order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}