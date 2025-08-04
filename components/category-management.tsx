"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, FolderOpen, Folder, ChevronRight } from "lucide-react"
import { 
  getCategories, 
  getCategoriesHierarchy,
  createCategory, 
  updateCategory, 
  deleteCategory, 
  type Category 
} from "@/lib/actions/server-actions"

interface CategoryFormProps {
  category?: Category
  parentCategories: Category[]
  onClose: () => void
  onSuccess: () => void
}

function CategoryForm({ category, parentCategories, onClose, onSuccess }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    parentId: category?.parentId || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: category ? formData.slug : generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      if (category) {
        result = await updateCategory(
          category.id, 
          formData.name, 
          formData.slug, 
          formData.parentId || null
        )
      } else {
        result = await createCategory(
          formData.name, 
          formData.slug, 
          formData.parentId || null
        )
      }

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || "Failed to save category")
      }
    } catch (error) {
      alert("An error occurred while saving the category")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="category-slug"
          required
        />
        <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name. Usually lowercase with hyphens.</p>
      </div>

      <div>
        <Label htmlFor="parent">Parent Category (Optional)</Label>
        <Select 
          value={formData.parentId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent category (leave empty for main category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Main Category)</SelectItem>
            {parentCategories
              .filter(cat => cat.parentId === null && (!category || cat.id !== category.id))
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Select a parent category to create a subcategory, or leave empty to create a main category.
        </p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[#e94491] hover:bg-[#d63384]">
          {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}

interface CategoryRowProps {
  category: Category
  level: number
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

function CategoryRow({ category, level, onEdit, onDelete }: CategoryRowProps) {
  const indentationStyle = {
    paddingLeft: `${level * 24}px`
  }

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium" style={indentationStyle}>
          <div className="flex items-center gap-2">
            {level > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            {level === 0 ? (
              <Folder className="w-4 h-4 text-[#e94491]" />
            ) : (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            )}
            {category.name}
            {level > 0 && <Badge variant="secondary" className="text-xs">Sub</Badge>}
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm text-gray-600">{category.slug}</TableCell>
        <TableCell>
          {category.parent ? (
            <Badge variant="outline" className="text-xs">
              {category.parent.name}
            </Badge>
          ) : (
            <Badge className="text-xs bg-green-100 text-green-800">
              Main Category
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {/* Render children */}
      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [hierarchicalCategories, setHierarchicalCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'flat' | 'hierarchy'>('hierarchy')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const [allCategories, hierarchyData] = await Promise.all([
        getCategories(),
        getCategoriesHierarchy()
      ])
      setCategories(allCategories)
      setHierarchicalCategories(hierarchyData)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will also affect any subcategories.")) {
      const result = await deleteCategory(id)
      if (result.success) {
        loadCategories()
      } else {
        alert(result.error || "Failed to delete category")
      }
    }
  }

  const flattenCategoriesForSearch = (cats: Category[]): Category[] => {
    let result: Category[] = []
    for (const cat of cats) {
      result.push(cat)
      if (cat.children) {
        result = result.concat(flattenCategoriesForSearch(cat.children))
      }
    }
    return result
  }

  const filteredCategories = viewMode === 'hierarchy' 
    ? hierarchicalCategories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.children && category.children.some(child => 
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

  const totalCategories = categories.length
  const mainCategories = categories.filter(cat => cat.parentId === null).length
  const subCategories = categories.filter(cat => cat.parentId !== null).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e94491]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#e94491] hover:bg-[#d63384]">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              parentCategories={categories}
              onClose={() => setIsAddDialogOpen(false)} 
              onSuccess={loadCategories} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#e94491] bg-opacity-10 rounded-lg">
                <FolderOpen className="w-5 h-5 text-[#e94491]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Folder className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Main Categories</p>
                <p className="text-2xl font-bold text-gray-900">{mainCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subcategories</p>
                <p className="text-2xl font-bold text-gray-900">{subCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode" className="text-sm font-medium">
                View:
              </Label>
              <Select value={viewMode} onValueChange={(value: 'flat' | 'hierarchy') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hierarchy">Hierarchy</SelectItem>
                  <SelectItem value="flat">Flat List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#e94491]" />
            Categories ({viewMode === 'hierarchy' ? 'Hierarchical View' : 'Flat View'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewMode === 'hierarchy' ? (
                // Hierarchical view
                filteredCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                    onEdit={setEditingCategory}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                // Flat view
                filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {category.parentId ? (
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#e94491]" />
                        )}
                        {category.name}
                        {category.parentId && <Badge variant="secondary" className="text-xs">Sub</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{category.slug}</TableCell>
                    <TableCell>
                      {category.parent ? (
                        <Badge variant="outline" className="text-xs">
                          {category.parent.name}
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Main Category
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No categories found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            parentCategories={categories}
            onClose={() => setEditingCategory(null)}
            onSuccess={loadCategories}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}