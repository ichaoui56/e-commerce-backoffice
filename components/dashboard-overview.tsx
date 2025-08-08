"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Eye, Plus, RefreshCw } from 'lucide-react'
import Link from "next/link"
import { getDashboardStats, getRecentActivity } from "@/lib/actions/server-actions"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  revenue: number
  lowStockItems: number
  pendingOrders: number
}

interface Activity {
  type: string
  title: string
  description: string
  time: Date
  icon: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
    lowStockItems: 0,
    pendingOrders: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch stats and activities in parallel
      const [statsData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity()
      ])
      
      setStats(statsData)
      setActivities(activitiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return ShoppingCart
      case 'Package': return Package
      case 'AlertTriangle': return AlertTriangle
      default: return Package
    }
  }

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-green-100'
      case 'product': return 'bg-blue-100'
      case 'alert': return 'bg-yellow-100'
      default: return 'bg-gray-100'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-green-600'
      case 'product': return 'text-blue-600'
      case 'alert': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e94491]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/products/add">
            <Button className="bg-[#e94491] hover:bg-[#d63384] w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Customers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#e94491] bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#e94491]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-600">{stats.lowStockItems} items need restocking</p>
              </div>
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-800">Pending Orders</p>
                <p className="text-sm text-blue-600">{stats.pendingOrders} orders awaiting processing</p>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/products/add">
              <Button className="w-full bg-[#e94491] hover:bg-[#d63384] justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const IconComponent = getIconComponent(activity.icon)
                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${getIconBgColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 ${getIconColor(activity.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{getTimeAgo(activity.time)}</Badge>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
