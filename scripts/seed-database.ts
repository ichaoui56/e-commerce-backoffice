import { db } from "@/lib/db"
import { users, categories, colors, sizes } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

async function seed() {
  try {
    console.log("🌱 Seeding database...")

    // Create admin user
    const hashedPassword = await hashPassword("admin123")

    await db
      .insert(users)
      .values({
        name: "Admin User",
        email: "admin@shahinestore.com",
        password_hash: hashedPassword,
      })
      .onConflictDoNothing()

    // Insert categories
    await db
      .insert(categories)
      .values([
        { name: "Clothing", slug: "clothing" },
        { name: "Electronics", slug: "electronics" },
        { name: "Accessories", slug: "accessories" },
        { name: "Footwear", slug: "footwear" },
        { name: "Home & Garden", slug: "home-garden" },
      ])
      .onConflictDoNothing()

    // Insert colors
    await db
      .insert(colors)
      .values([
        { name: "Red", hex: "#ef4444" },
        { name: "Blue", hex: "#3b82f6" },
        { name: "Green", hex: "#10b981" },
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#ffffff" },
        { name: "Gray", hex: "#6b7280" },
        { name: "Pink", hex: "#ec4899" },
        { name: "Purple", hex: "#8b5cf6" },
        { name: "Yellow", hex: "#eab308" },
        { name: "Orange", hex: "#f97316" },
      ])
      .onConflictDoNothing()

    // Insert sizes
    await db
      .insert(sizes)
      .values([
        { label: "XS" },
        { label: "S" },
        { label: "M" },
        { label: "L" },
        { label: "XL" },
        { label: "XXL" },
        { label: "36" },
        { label: "37" },
        { label: "38" },
        { label: "39" },
        { label: "40" },
        { label: "41" },
        { label: "42" },
        { label: "43" },
        { label: "44" },
        { label: "45" },
      ])
      .onConflictDoNothing()

    console.log("✅ Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seed()
