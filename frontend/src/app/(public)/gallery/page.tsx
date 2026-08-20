import { GALLERY_IMAGES } from "@/data/products";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        breadcrumb="Gallery"
        title="The House of Bread, in Pictures"
        subtitle="Fresh bakes, warm ovens and happy customers — here's a glimpse of life behind the counter."
      />

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {GALLERY_IMAGES.map((img, i) => (
              <figure
                key={img.src + i}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl shadow-md"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-crust-deep/80 to-transparent p-4 pt-10 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {img.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-crust-deep sm:text-3xl">
            Snap it, tag it, share it
          </h2>
          <p className="mt-2 text-crust-deep/70">
            Tag <span className="font-semibold text-crust">@HouseOfBreadLondon</span> in your
            bakes — we feature our favourite shots on the wall behind the counter.
          </p>
        </div>
      </section>
    </>
  );
}
