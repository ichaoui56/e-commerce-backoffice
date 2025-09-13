"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OptimizedImage } from "./optimized-image"

interface ProductDetailsProps {
  product: any
}

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

export function ProductDetails({ product }: ProductDetailsProps) {
  if (!product) return null

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#e94491] to-[#f472b6] p-6 rounded-xl text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-white/80 mb-4">{product.description || "No description available"}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getStatusColor(product.status)} border-0 font-semibold`}>
                {product.status.replace("_", " ")}
              </Badge>
              {product.top_price && (
                <Badge className="bg-yellow-500 text-white border-0 font-semibold">⭐ Top Product</Badge>
              )}
              {product.solde_percentage && (
                <Badge className="bg-red-500 text-white border-0 font-semibold">{product.solde_percentage}% OFF</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{product.totalStock}</div>
            <div className="text-sm text-white/80">Total Stock</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">{product.variants?.length || 0}</span>
            </div>
            <div className="text-sm font-semibold text-blue-700">Colors Available</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">
                {product.variants?.reduce(
                  (total: number, variant: any) => total + (variant.sizeStocks?.length || 0),
                  0,
                ) || 0}
              </span>
            </div>
            <div className="text-sm font-semibold text-green-700">Size Options</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">{product.totalStock}</span>
            </div>
            <div className="text-sm font-semibold text-purple-700">Total Stock</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-sm">
                {product.variants?.reduce((min: number, variant: any) => {
                  const variantMin =
                    variant.sizeStocks?.reduce(
                      (vMin: number, ss: any) => Math.min(vMin, Number(ss.price)),
                      Number.POSITIVE_INFINITY,
                    ) || Number.POSITIVE_INFINITY
                  return Math.min(min, variantMin)
                }, Number.POSITIVE_INFINITY) || 0}{" "}
                MAD
              </span>
            </div>
            <div className="text-sm font-semibold text-orange-700">Starting Price</div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ℹ️</span>
            </div>
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1">Category</h4>
                <p className="text-blue-700">{product.category?.name || "No Category"}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1">Total Stock</h4>
                <p
                  className={`font-bold text-lg ${
                    product.totalStock === 0
                      ? "text-red-600"
                      : product.totalStock < 20
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {product.totalStock} units
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {product.solde_percentage && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-1">Discount</h4>
                  <p className="text-red-700 font-bold">{product.solde_percentage}% off</p>
                </div>
              )}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-1">Total Variants</h4>
                <p className="text-purple-700 font-bold">{product.variants?.length || 0} color variants</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants Details */}
      {product.variants && product.variants.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎨</span>
              </div>
              Product Variants ({product.variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {product.variants.map((variant: any, index: number) => (
                <Card
                  key={variant.id}
                  className="border-l-8 shadow-lg bg-gradient-to-r from-white to-gray-50/50"
                  style={{ borderLeftColor: variant.color?.hex || "#000000" }}
                >
                  <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg">
                          {variant.image_url ? (
                            <OptimizedImage
                            src={variant.image_url || "/placeholder.svg"}
                            alt={`${product.name} - ${variant.color?.name}`}
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-xl object-cover border-2 border-white"
                            sizes="96px"
                            quality={75}
                          />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#e94491] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="text-2xl font-bold text-gray-800">{variant.color?.name}</h4>
                          <div
                            className="w-8 h-8 rounded-full border-4 border-white shadow-lg"
                            style={{ backgroundColor: variant.color?.hex || "#000000" }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                            {variant.sizeStocks?.length || 0} sizes
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">
                            {variant.sizeStocks?.reduce((total: number, ss: any) => total + (ss.stock || 0), 0) || 0}{" "}
                            total stock
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold">
                            {Math.min(...(variant.sizeStocks?.map((ss: any) => Number(ss.price)) || [0]))} MAD -
                            {Math.max(...(variant.sizeStocks?.map((ss: any) => Number(ss.price)) || [0]))} MAD
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Size Stock Table */}
                  {variant.sizeStocks && variant.sizeStocks.length > 0 && (
                    <CardContent className="p-6">
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50">
                              <TableHead className="font-bold text-gray-700 py-4">Size</TableHead>
                              <TableHead className="font-bold text-gray-700 py-4">Price</TableHead>
                              <TableHead className="font-bold text-gray-700 py-4">Stock</TableHead>
                              <TableHead className="font-bold text-gray-700 py-4">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {variant.sizeStocks.map((sizeStock: any) => (
                              <TableRow key={sizeStock.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="py-4">
                                  <Badge
                                    variant="outline"
                                    className="font-bold text-sm px-3 py-2 border-2"
                                    style={{
                                      borderColor: variant.color?.hex || "#000000",
                                      color: variant.color?.hex || "#000000",
                                    }}
                                  >
                                    {sizeStock.size?.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="font-bold text-lg text-gray-800">
                                    {Number(sizeStock.price).toFixed(2)} MAD
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span
                                    className={`font-bold text-lg ${
                                      sizeStock.stock === 0
                                        ? "text-red-600"
                                        : sizeStock.stock < 10
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {sizeStock.stock}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge
                                    className={`font-semibold ${
                                      sizeStock.stock === 0
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : sizeStock.stock < 10
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                          : "bg-green-100 text-green-800 border-green-200"
                                    }`}
                                  >
                                    {sizeStock.stock === 0
                                      ? "Out of Stock"
                                      : sizeStock.stock < 10
                                        ? "Low Stock"
                                        : "In Stock"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Variants Message */}
      {(!product.variants || product.variants.length === 0) && (
        <Card className="shadow-lg border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Variants Available</h3>
            <p className="text-gray-500">This product doesn't have any color variants configured yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
