"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPickerField } from "@/components/icon-picker";

export function FacultyDirectoryTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [facultyExpandedIdx, setFacultyExpandedIdx] = useState<number>(0);
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-6">
      {/* Faculty header */}
      <div className="flex justify-between items-center">
        <Label className="font-bold">Faculty Directory</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const current = getActiveTabPayload().list || [];
            const nextIdx = current.length;
            const next = [
              ...current,
              {
                id: `faculty_${String(nextIdx + 1).padStart(3, "0")}`,
                name: "",
                photo: "",
                designation: "",
                department: "",
                education: [],
                professional_experience: [],
              },
            ];
            updateActiveTabPayload({ list: next });
            setFacultyExpandedIdx(nextIdx);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Faculty
        </Button>
      </div>

      {/* Faculty picker tabs */}
      {(getActiveTabPayload().list || []).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(getActiveTabPayload().list || []).map((f: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFacultyExpandedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                facultyExpandedIdx === idx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.name || `Faculty ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Active faculty editor */}
      {(() => {
        const list = getActiveTabPayload().list || [];
        const fi = facultyExpandedIdx;
        if (fi >= list.length) return null;
        const f = list[fi] || {};
        const updateFaculty = (updates: any) => {
          const next = [...list];
          next[fi] = { ...next[fi], ...updates };
          updateActiveTabPayload({ list: next });
        };
        return (
          <div className="border p-4 rounded-xl space-y-6 bg-muted/5">
            {/* Basic info */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">ID</Label>
                  <Input
                    placeholder="e.g. faculty_001"
                    value={f.id || ""}
                    onChange={(e) => updateFaculty({ id: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Full Name</Label>
                  <Input
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={f.name || ""}
                    onChange={(e) =>
                      updateFaculty({
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Designation</Label>
                  <Input
                    placeholder="e.g. Professor & Head of Cardiology"
                    value={f.designation || ""}
                    onChange={(e) =>
                      updateFaculty({
                        designation: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <Input
                    placeholder="e.g. DEPARTMENT OF CARDIOLOGY"
                    value={f.department || ""}
                    onChange={(e) =>
                      updateFaculty({
                        department: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Photo</Label>
                  <ImageUpload
                    value={f.photo || ""}
                    onChange={(url) => updateFaculty({ photo: url })}
                    context={`faculty-directory/photo-${fi}`}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = list.filter((_: any, i: number) => i !== fi);
                  updateActiveTabPayload({ list: next });
                  setFacultyExpandedIdx(Math.max(0, fi - 1));
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Education */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">Education</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateFaculty({
                      education: [
                        ...(f.education || []),
                        {
                          degree: "",
                          institution: "",
                          duration: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Degree
                </Button>
              </div>
              {(f.education || []).map((edu: any, ei: number) => (
                <div key={ei} className="flex gap-2 items-center">
                  <Input
                    placeholder="Degree (e.g. DM in Cardiology)"
                    value={edu.degree || ""}
                    onChange={(e) => {
                      const next = [...(f.education || [])];
                      next[ei] = {
                        ...next[ei],
                        degree: e.target.value,
                      };
                      updateFaculty({ education: next });
                    }}
                  />
                  <Input
                    placeholder="Institution (e.g. AIIMS, New Delhi)"
                    value={edu.institution || ""}
                    onChange={(e) => {
                      const next = [...(f.education || [])];
                      next[ei] = {
                        ...next[ei],
                        institution: e.target.value,
                      };
                      updateFaculty({ education: next });
                    }}
                  />
                  <Input
                    placeholder="Duration (e.g. 2005 - 2008)"
                    className="w-36"
                    value={edu.duration || ""}
                    onChange={(e) => {
                      const next = [...(f.education || [])];
                      next[ei] = {
                        ...next[ei],
                        duration: e.target.value,
                      };
                      updateFaculty({ education: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateFaculty({
                        education: (f.education || []).filter(
                          (_: any, i: number) => i !== ei,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Professional Experience */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-sm">
                  Professional Experience
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateFaculty({
                      professional_experience: [
                        ...(f.professional_experience || []),
                        {
                          role: "",
                          organization: "",
                          duration: "",
                          is_current: false,
                          current_badge: "",
                          icon: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Experience
                </Button>
              </div>
              {(f.professional_experience || []).map((exp: any, ei: number) => (
                <div
                  key={ei}
                  className={`border p-3 rounded-lg space-y-3 ${
                    exp.is_current
                      ? "border-primary/30 bg-primary/5"
                      : "bg-muted/5"
                  }`}
                >
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Role (e.g. Senior Consultant)"
                      value={exp.role || ""}
                      onChange={(e) => {
                        const next = [...(f.professional_experience || [])];
                        next[ei] = {
                          ...next[ei],
                          role: e.target.value,
                        };
                        updateFaculty({
                          professional_experience: next,
                        });
                      }}
                    />
                    <Input
                      placeholder="Organization (e.g. City Heart Institute)"
                      value={exp.organization || ""}
                      onChange={(e) => {
                        const next = [...(f.professional_experience || [])];
                        next[ei] = {
                          ...next[ei],
                          organization: e.target.value,
                        };
                        updateFaculty({
                          professional_experience: next,
                        });
                      }}
                    />
                    <Input
                      placeholder="Duration (e.g. 2015 - 2020)"
                      className="w-36"
                      value={exp.duration || ""}
                      onChange={(e) => {
                        const next = [...(f.professional_experience || [])];
                        next[ei] = {
                          ...next[ei],
                          duration: e.target.value,
                        };
                        updateFaculty({
                          professional_experience: next,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateFaculty({
                          professional_experience: (
                            f.professional_experience || []
                          ).filter((_: any, i: number) => i !== ei),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-4 items-center pl-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.is_current || false}
                        onChange={(e) => {
                          const next = [...(f.professional_experience || [])];
                          next[ei] = {
                            ...next[ei],
                            is_current: e.target.checked,
                            current_badge: e.target.checked
                              ? next[ei].current_badge || "CURRENT POSITION"
                              : next[ei].current_badge,
                          };
                          updateFaculty({
                            professional_experience: next,
                          });
                        }}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        Current Position
                      </span>
                    </label>
                    {exp.is_current && (
                      <Input
                        placeholder="Badge text (e.g. CURRENT POSITION)"
                        className="h-7 text-xs flex-1"
                        value={exp.current_badge || ""}
                        onChange={(e) => {
                          const next = [...(f.professional_experience || [])];
                          next[ei] = {
                            ...next[ei],
                            current_badge: e.target.value,
                          };
                          updateFaculty({
                            professional_experience: next,
                          });
                        }}
                      />
                    )}
                    <IconPickerField
                      value={exp.icon || ""}
                      onChange={(iconUrl) => {
                        const next = [...(f.professional_experience || [])];
                        next[ei] = {
                          ...next[ei],
                          icon: iconUrl,
                        };
                        updateFaculty({
                          professional_experience: next,
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
