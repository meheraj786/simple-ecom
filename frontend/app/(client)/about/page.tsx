import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="pb-20">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:pb-16">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-emerald-800">
            A little about us
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Everyday finds,
            <br />
            chosen with care.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
            E-Com brings clothing, accessories, and useful everyday pieces
            together in one considered store. We focus on clear product details,
            practical choices, and a dependable experience from browsing to
            delivery.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium hover:gap-3"
          >
            Explore the collection <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative min-h-72 overflow-hidden bg-[#e8e6e1] sm:min-h-96">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
            alt="Friends browsing clothing together"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y bg-[#f4f5f1]">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-2">
          <article className="grid content-start gap-4 border-b py-8 md:border-b-0 md:border-r md:py-12 md:pr-10">
            <div className="flex size-10 items-center justify-center border border-emerald-900/15 bg-white text-emerald-900">
              <Heart className="size-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Our mission
            </p>
            <h2 className="text-2xl font-semibold">
              Make good choices easier.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              We bring useful, thoughtfully selected products into one place and
              make it easier to understand what you’re buying, choose the right
              option, and receive it with confidence.
            </p>
          </article>

          <article className="grid content-start gap-4 py-8 md:py-12 md:pl-10">
            <div className="flex size-10 items-center justify-center border border-emerald-900/15 bg-white text-emerald-900">
              <Eye className="size-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Our vision
            </p>
            <h2 className="text-2xl font-semibold">
              A store people can rely on.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              We aim to build a trusted shopping destination known for honest
              product information, responsive customer care, and reliable
              delivery as our community grows.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:py-14">
        <div>
          <h2 className="text-xl font-semibold">We’re here to help.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Have a question about the store or an order? Our support team is
            ready to listen.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex h-10 items-center justify-center gap-2 bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
        >
          Contact us <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
