import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/templates",
    title: "Templates",
    description: "Design reusable templates with text and image placeholders.",
  },
  {
    href: "/brand",
    title: "Brand",
    description: "Define brand colors, fonts, and a logo to reuse while designing.",
  },
  {
    href: "/connections",
    title: "Connections",
    description: "Wire up data sources (Notion) that fill placeholders.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Design templates, then connect a data source to render them automatically.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full transition-colors hover:border-foreground/20">
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
