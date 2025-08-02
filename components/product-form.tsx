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
import { X, Plus, Trash2, Upload } from "lucide-react"
import Image from "next/image"
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
} from "@/lib/server-actions"

interface ProductFormProps {
  product?: any
  onClose: () => void
  onSuccess?: () => void
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
  image_url: string
  sizes: ColorSize[]
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
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

  const loadData = async () => {
    const [categoriesData, colorsData, sizesData] = await Promise.all([getCategories(), getColors(), getSizes()])

    setCategories(categoriesData)
    setAllColors(colorsData)
    setAllSizes(sizesData)

    // If editing, populate existing data
    if (product?.variants) {
      const existingColors: SelectedColor[] = []

      product.variants.forEach((variant: any) => {
        const existingColor = existingColors.find((c) => c.id === variant.color_id)

        if (existingColor) {
          // Add sizes to existing color
          variant.sizeStocks.forEach((sizeStock: any) => {
            existingColor.sizes.push({
              id: sizeStock.size_id,
              label: sizeStock.size?.label || "",
              stock: sizeStock.stock,
              price: Number(sizeStock.price),
            })
          })
        } else {
          // Create new color with its sizes
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
            image_url: variant.image_url || "",
            sizes: colorSizes,
          })
        }
      })

      setSelectedColors(existingColors)
    }
  }

  const handleColorAdd = (colorId: string) => {
    const color = allColors.find((c) => c.id === colorId)
    if (color && !selectedColors.find((c) => c.id === colorId)) {
      setSelectedColors((prev) => [
        ...prev,
        {
          id: color.id,
          name: color.name,
          hex: color.hex || "#000000",
          image_url: "",
          sizes: [],
        },
      ])
    }
  }

  const handleColorRemove = (colorId: string) => {
    setSelectedColors((prev) => prev.filter((c) => c.id !== colorId))
  }

  const handleImageUpload = (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to cloud storage here
      const imageUrl = URL.createObjectURL(file)

      setSelectedColors((prev) =>
        prev.map((color) => (color.id === colorId ? { ...color, image_url: imageUrl } : color)),
      )
    }
  }

  const removeColorImage = (colorId: string) => {
    setSelectedColors((prev) => prev.map((color) => (color.id === colorId ? { ...color, image_url: "" } : color)))
  }

  const addSizeToColor = (colorId: string, sizeId: string) => {
    const size = allSizes.find((s) => s.id === sizeId)
    if (!size) return

    setSelectedColors((prev) =>
      prev.map((color) => {
        if (color.id === colorId) {
          // Check if size already exists for this color
          if (color.sizes.find((s) => s.id === sizeId)) {
            return color
          }

          return {
            ...color,
            sizes: [
              ...color.sizes,
              {
                id: size.id,
                label: size.label,
                stock: 0,
                price: 0,
              },
            ],
          }
        }
        return color
      }),
    )
  }

  const addCustomSizeToColor = async (colorId: string, customSize: string) => {
    if (!customSize.trim()) return

    setSelectedColors((prev) =>
      prev.map((color) => {
        if (color.id === colorId) {
          // Check if custom size already exists for this color
          if (color.sizes.find((s) => s.label === customSize.trim())) {
            return color
          }

          // Create the size in database if it doesn't exist
          createSize(customSize.trim()).then((result) => {
            if (result.success && result.size) {
              setAllSizes((prev) => [...prev, result.size!])
            }
          })

          return {
            ...color,
            sizes: [
              ...color.sizes,
              {
                id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID, will be replaced when saved
                label: customSize.trim(),
                stock: 0,
                price: 0,
              },
            ],
          }
        }
        return color
      }),
    )
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

    // Check if color name already exists
    const existingColor = [...allColors, ...selectedColors].find(
      (c) => c.name.toLowerCase() === customColorData.name.toLowerCase(),
    )

    if (existingColor) {
      alert("A color with this name already exists")
      return
    }

    try {
      // Create the color in the database
      const result = await createColor(customColorData.name.trim(), customColorData.hex)

      if (result.success && result.color) {
        // Add to selected colors
        const newColor: SelectedColor = {
          id: result.color.id,
          name: result.color.name,
          hex: result.color.hex || "#000000",
          image_url: "",
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
      alert("An error occurred while creating the color")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.category_id || selectedColors.length === 0) {
        alert("Please fill in all required fields and select at least one color.")
        return
      }

      // Validate that each color has at least one size
      const colorsWithoutSizes = selectedColors.filter((color) => color.sizes.length === 0)
      if (colorsWithoutSizes.length > 0) {
        alert(`Please add at least one size for: ${colorsWithoutSizes.map((c) => c.name).join(", ")}`)
        return
      }

      const colorsData = selectedColors.map((color) => ({
        color_id: color.id,
        image_url: color.image_url,
        sizes: color.sizes.map((size) => ({
          size_id: size.id,
          stock: Number(size.stock) || 0,
          price: Number(size.price) || 0,
        })),
      }))

      const productData = {
        ...formData,
        solde_percentage: formData.solde_percentage ? Number(formData.solde_percentage) : undefined,
        colors: colorsData,
      }

      let result
      if (product) {
        result = await updateProduct(product.id, productData)
      } else {
        result = await createProduct(productData)
      }

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        alert(result.error || "Failed to save product")
      }
    } catch (error) {
      alert("An error occurred while saving the product")
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalVariants = () => {
    return selectedColors.reduce((total, color) => total + color.sizes.length, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.solde_percentage}
                onChange={(e) => setFormData((prev) => ({ ...prev, solde_percentage: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="top-product"
                checked={formData.top_price}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, top_price: checked }))}
              />
              <Label htmlFor="top-product">Top Product</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Colors & Sizes *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Add Color</Label>

            {/* Existing Colors Dropdown */}
            <Select onValueChange={handleColorAdd}>
              <SelectTrigger>
                <SelectValue placeholder="Select from existing colors" />
              </SelectTrigger>
              <SelectContent>
                {allColors
                  .filter((color) => !selectedColors.find((sc) => sc.id === color.id))
                  .map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.hex || "#000000" }}
                        />
                        {color.name}
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
                className="w-full border-dashed border-[#e94491] text-[#e94491] hover:bg-[#e94491]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Color
              </Button>
            ) : (
              <Card className="border-[#e94491] bg-[#e94491]/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Create New Color</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingCustomColor(false)
                        setCustomColorData({ name: "", hex: "#000000" })
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="custom-color-name" className="text-sm">
                        Color Name
                      </Label>
                      <Input
                        id="custom-color-name"
                        value={customColorData.name}
                        onChange={(e) => setCustomColorData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Forest Green, Navy Blue"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="custom-color-hex" className="text-sm">
                        Color
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="custom-color-hex"
                          type="color"
                          value={customColorData.hex}
                          onChange={(e) => setCustomColorData((prev) => ({ ...prev, hex: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={customColorData.hex}
                          onChange={(e) => setCustomColorData((prev) => ({ ...prev, hex: e.target.value }))}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: customColorData.hex }}
                      />
                      <span className="text-sm text-gray-600">Preview: {customColorData.name || "Unnamed Color"}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={handleCustomColorAdd}
                        className="bg-[#e94491] hover:bg-[#d63384] flex-1"
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
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Colors */}
          {selectedColors.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Selected Colors ({selectedColors.length})</Label>
                <Badge variant="outline" className="bg-[#e94491]/10 text-[#e94491]">
                  Total Variants: {getTotalVariants()}
                </Badge>
              </div>

              {selectedColors.map((color) => (
                <Card key={color.id} className="border-l-4" style={{ borderLeftColor: color.hex }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <h4 className="font-semibold text-lg">{color.name}</h4>
                          <p className="text-sm text-gray-600">{color.sizes.length} sizes configured</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleColorRemove(color.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <Label className="text-sm font-medium">Image for {color.name}</Label>
                      {color.image_url ? (
                        <div className="relative mt-2">
                          <Image
                            src={color.image_url || "/placeholder.svg"}
                            alt={`${color.name} variant`}
                            width={120}
                            height={120}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => removeColorImage(color.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mt-2">
                          <Label htmlFor={`image-${color.id}`} className="cursor-pointer">
                            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Upload image for {color.name}</span>
                          </Label>
                          <Input
                            id={`image-${color.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(color.id, e)}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* Size Management for this Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Sizes for {color.name}</Label>

                      {/* Add Size Options */}
                      <div className="flex gap-2">
                        <Select onValueChange={(sizeId) => addSizeToColor(color.id, sizeId)}>
                          <SelectTrigger className="flex-1">
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

                        <div className="flex gap-1">
                          <Input
                            placeholder="Custom size (e.g., 38, XS)"
                            className="w-40"
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
                              const input = (e.target as HTMLElement).parentElement?.querySelector(
                                "input",
                              ) as HTMLInputElement
                              if (input) {
                                addCustomSizeToColor(color.id, input.value)
                                input.value = ""
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Sizes Table for this Color */}
                      {color.sizes.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-24">Size</TableHead>
                                <TableHead className="w-32">Price ($)</TableHead>
                                <TableHead className="w-32">Stock</TableHead>
                                <TableHead className="w-16">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {color.sizes.map((size) => (
                                <TableRow key={size.id}>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {size.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={size.price}
                                      onChange={(e) =>
                                        updateColorSize(color.id, size.id, "price", Number(e.target.value))
                                      }
                                      className="w-full"
                                      placeholder="0.00"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={size.stock}
                                      onChange={(e) =>
                                        updateColorSize(color.id, size.id, "stock", Number(e.target.value))
                                      }
                                      className="w-full"
                                      placeholder="0"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSizeFromColor(color.id, size.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {color.sizes.length === 0 && (
                        <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          No sizes added for {color.name} yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || selectedColors.length === 0 || getTotalVariants() === 0}
          className="bg-[#e94491] hover:bg-[#d63384]"
        >
          {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
