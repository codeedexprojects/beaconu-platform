import Image from "next/image";
import { GraduationCap, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicFacultyMember } from "@beaconu/types";

interface FacultySectionProps {
  faculty: PublicFacultyMember[];
}

export function FacultySection({ faculty }: FacultySectionProps) {
  if (faculty.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Faculty details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Faculty</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {faculty.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-border/60 p-5"
          >
            <div className="flex items-center gap-3">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name ?? "Faculty"}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.designation}
                </p>
                {member.department ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {member.department}
                  </p>
                ) : null}
              </div>
            </div>

            {(member.education?.length ?? 0) > 0 ? (
              <div className="mt-4 border-t border-border/60 pt-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Education
                </p>
                <ul className="mt-2 space-y-1.5">
                  {member.education?.map((edu, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium">{edu.degree}</span>
                      {edu.institution ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {edu.institution}
                        </span>
                      ) : null}
                      {edu.duration ? (
                        <span className="text-muted-foreground">
                          {" "}
                          ({edu.duration})
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(member.professional_experience?.length ?? 0) > 0 ? (
              <div className="mt-4 border-t border-border/60 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Experience
                </p>
                <ul className="mt-2 space-y-2">
                  {member.professional_experience?.map((exp, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{exp.role}</span>
                        {exp.is_current ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {exp.organization}
                        {exp.duration ? ` · ${exp.duration}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
