import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactMessageForm } from "@/components/contact-message-form";

export default function ContactPage() {
  return (
    <main className="pb-20">
      <section className="relative isolate flex min-h-72 items-end overflow-hidden bg-[#17231d] sm:min-h-80">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=85"
          alt="A thoughtfully arranged clothing store"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/45 to-black/15" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-9 pt-24 text-white sm:px-8 sm:pb-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/75">
            E-Com / Customer care
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Contact our team
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
            Questions about a product or order? Send us a message and we’ll
            follow up.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)] lg:gap-12 lg:py-14">
        <aside className="grid content-start gap-6">
          <div>
            <h2 className="text-lg font-semibold">Reach us</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Use the form to send your question directly to our support inbox.
            </p>
          </div>
          <dl className="grid gap-5 border-y py-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-emerald-800" />
              <div className="grid gap-1">
                <dt className="text-sm font-medium">Email</dt>
                <dd className="text-sm text-muted-foreground">
                  support@store.com
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-emerald-800" />
              <div className="grid gap-1">
                <dt className="text-sm font-medium">Phone</dt>
                <dd className="text-sm text-muted-foreground">
                  +880 1700-000000
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-800" />
              <div className="grid gap-1">
                <dt className="text-sm font-medium">Location</dt>
                <dd className="text-sm text-muted-foreground">
                  Dhaka, Bangladesh
                </dd>
              </div>
            </div>
          </dl>
          <p className="text-xs leading-5 text-muted-foreground">
            Your message will be stored securely and reviewed by our support
            team.
          </p>
        </aside>

        <section className="min-w-0 border p-5 sm:p-8">
          <ContactMessageForm />
        </section>
      </div>
    </main>
  );
}
