"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Hash,
  User,
  ShoppingCart,
  DollarSign,
} from "lucide-react"
import { getOrders, updateOrderStatus, deleteOrder, approveOrder } from "@/lib/actions/server-actions"

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "delivered":
      return "bg-green-100 text-green-800 border-green-300"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Package className="w-4 h-4" />
    case "confirmed":
      return <CheckCircle className="w-4 h-4" />
    case "shipped":
      return <Truck className="w-4 h-4" />
    case "delivered":
      return <CheckCircle className="w-4 h-4" />
    case "cancelled":
      return <XCircle className="w-4 h-4" />
    default:
      return <Package className="w-4 h-4" />
  }
}

export function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  ) => {
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      loadOrders()
    } else {
      alert(result.error || "Failed to update order status")
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    const result = await approveOrder(orderId)
    if (result.success) {
      loadOrders()
      alert("Order approved successfully! Stock has been reduced.")
    } else {
      alert(result.error || "Failed to approve order")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    const result = await deleteOrder(orderId)
    if (result.success) {
      loadOrders()
      alert("Order deleted successfully!")
    } else {
      alert(result.error || "Failed to delete order")
    }
  }

  const openViewDialog = (order: any) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const calculateOrderTotals = (order: any) => {
    const subtotal = order.items.reduce((sum: number, item: any) => {
      return sum + Number.parseFloat(item.price_at_purchase) * item.quantity
    }, 0)

    const shippingCost = Number.parseFloat(order.shipping_cost || 0)
    const grandTotal = subtotal + shippingCost

    return {
      subtotal,
      shippingCost,
      grandTotal,
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.ref_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {orders.filter((o) => o.status === "pending").length} Pending
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {orders.filter((o) => o.status === "confirmed").length} Confirmed
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {orders.filter((o) => o.status === "shipped").length} Shipped
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by order ID, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-mono text-sm font-medium">{order.ref_id}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate max-w-[120px] sm:max-w-none">{order.name}</div>
                        <div className="text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">{order.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="font-medium">${order.total.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit border`}>
                        {getStatusIcon(order.status)}
                        <span className="hidden sm:inline">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewDialog(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>

                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveOrder(order.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            Approve
                          </Button>
                        )}

                        <Select
                          value={order.status}
                          onValueChange={(value: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") =>
                            handleStatusUpdate(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-20 sm:w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this order? This action cannot be undone and will
                                permanently remove the order from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details - #{selectedOrder?.ref_id}
            </DialogTitle>
            <DialogDescription>Complete order information and items</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">Name</div>
                          <div className="font-medium">{selectedOrder.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium">{selectedOrder.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">City</div>
                          <div className="font-medium">{selectedOrder.city}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">Order Date</div>
                          <div className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Status:</span>
                      </div>
                      <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 border`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Order Items ({selectedOrder.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, index: number) => (
                        <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {(() => {
                              // Helper function to get the best available image URL
                              const getImageUrl = () => {
                                if (item.image_urls && item.image_urls.length > 0) {
                                  return item.image_urls[0]
                                }
                                if (item.image_url) {
                                  return item.image_url
                                }
                                return null
                              }

                              const imageUrl = getImageUrl()

                              return imageUrl ? (
                                <img
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-md"
                                  onError={(e) => {
                                    // If image fails to load, hide img and show placeholder
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                    const placeholder = target.parentElement?.querySelector(
                                      ".image-placeholder",
                                    ) as HTMLElement
                                    if (placeholder) {
                                      placeholder.style.display = "flex"
                                    }
                                  }}
                                />
                              ) : null
                            })()}
                            <div
                              className={`image-placeholder w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center ${
                                (item.image_urls && item.image_urls.length > 0) || item.image_url ? "hidden" : ""
                              }`}
                            >
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center gap-4">
                                <span>Color: {item.color.name}</span>
                                <span>Size: {item.size.label}</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Unit Price: ${Number.parseFloat(item.price_at_purchase).toFixed(2)}</span>
                                <span className="font-medium">
                                  Subtotal: ${(Number.parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const { subtotal, shippingCost, grandTotal } = calculateOrderTotals(selectedOrder)

                      return (
                        <div className="space-y-3">
                          {/* Products Subtotal */}
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">Products Subtotal:</span>
                            </div>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>

                          {/* Shipping Cost */}
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                Shipping Cost
                                {selectedOrder.shipping_option && (
                                  <span className="text-sm text-gray-500 ml-1">({selectedOrder.shipping_option})</span>
                                )}
                                :
                              </span>
                            </div>
                            <span className="font-medium">
                              {shippingCost > 0 ? `${shippingCost.toFixed(2)} MAD` : "Free"}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-gray-200 my-2"></div>

                          {/* Grand Total */}
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">${grandTotal.toFixed(2)}</span>
                          </div>

                          {/* Additional Info */}
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Number of Items:</span>
                                <span className="font-medium">{selectedOrder.items.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Quantity:</span>
                                <span className="font-medium">
                                  {selectedOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                                </span>
                              </div>
                              {selectedOrder.shipping_option && (
                                <div className="flex justify-between">
                                  <span>Shipping Method:</span>
                                  <span className="font-medium">{selectedOrder.shipping_option}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedOrder?.status === "pending" && (
              <Button
                onClick={() => {
                  handleApproveOrder(selectedOrder.id)
                  setIsViewDialogOpen(false)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
