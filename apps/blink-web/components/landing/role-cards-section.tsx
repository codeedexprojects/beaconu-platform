import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLINK_ROLES } from "@/lib/roles";

export function RoleCardsSection() {
  return (
    <section id="roles" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Who can join Blink?
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            Pick the counselling track that fits you best — tell us a bit about
            yourself and the Blink team will take it from there.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {BLINK_ROLES.map((role) => (
            <Card key={role.slug} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <role.icon className="h-5 w-5" />
                  </span>
                  <Badge variant="outline">Request to join</Badge>
                </div>
                <CardTitle className="mt-3 text-xl">{role.title}</CardTitle>
                <CardDescription>{role.tagline}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
                <ul className="space-y-2">
                  {role.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full gap-2">
                  <Link href={`/register/${role.slug}`}>
                    {role.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
