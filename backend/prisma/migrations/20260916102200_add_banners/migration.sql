-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "alt_text" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "cta_label" TEXT NOT NULL,
    "cta_link" TEXT NOT NULL,
    "overlay_heading" TEXT NOT NULL,
    "overlay_subheading" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_active_sort_idx" ON "banners"("active", "sort_order");
