import { redirect } from "next/navigation"
import { ProductForm } from "@/components/product-form"
import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getProductById } from "@/lib/actions/server-actions"
import { notFound } from "next/navigation"

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:block">Back to Products</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information and variants</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  )
}
