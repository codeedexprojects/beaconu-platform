"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInterviewSettings,
  useUpdateInterviewSettings,
} from "@/hooks/use-interviews";

const settingsSchema = z.object({
  gmeetHeading: z.string().trim().max(255).optional(),
  gmeetDescription: z.string().trim().max(2000).optional(),
  gmeetInstructions: z.array(z.string().trim().min(1)).max(20),
  onCampusHeading: z.string().trim().max(255).optional(),
  onCampusDescription: z.string().trim().max(2000).optional(),
  onCampusInstructions: z.array(z.string().trim().min(1)).max(20),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

const EMPTY_VALUES: SettingsFormValues = {
  gmeetHeading: "",
  gmeetDescription: "",
  gmeetInstructions: [],
  onCampusHeading: "",
  onCampusDescription: "",
  onCampusInstructions: [],
};

function ModeInstructionsBlock({
  title,
  description,
  headingField,
  descriptionField,
  instructionsField,
  form,
}: {
  title: string;
  description: string;
  headingField: "gmeetHeading" | "onCampusHeading";
  descriptionField: "gmeetDescription" | "onCampusDescription";
  instructionsField: "gmeetInstructions" | "onCampusInstructions";
  form: ReturnType<typeof useForm<SettingsFormValues>>;
}) {
  const [newInstruction, setNewInstruction] = useState("");
  const instructions = form.watch(instructionsField);

  function addInstruction() {
    const value = newInstruction.trim();
    if (!value) return;
    form.setValue(instructionsField, [...instructions, value]);
    setNewInstruction("");
  }

  function removeInstruction(index: number) {
    form.setValue(
      instructionsField,
      instructions.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={headingField}>Heading</Label>
        <Input id={headingField} {...form.register(headingField)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descriptionField}>Description</Label>
        <Textarea
          id={descriptionField}
          rows={3}
          {...form.register(descriptionField)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Instructions</Label>
        <div className="space-y-2">
          {instructions.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <p className="flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {item}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeInstruction(i)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Input
            placeholder="Add an instruction"
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInstruction();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={addInstruction}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InterviewSettingsTab() {
  const { data: settings, isLoading } = useInterviewSettings();
  const { mutate: update, isPending } = useUpdateInterviewSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        gmeetHeading: settings.gmeet.heading ?? "",
        gmeetDescription: settings.gmeet.description ?? "",
        gmeetInstructions: settings.gmeet.instructions,
        onCampusHeading: settings.onCampus.heading ?? "",
        onCampusDescription: settings.onCampus.description ?? "",
        onCampusInstructions: settings.onCampus.instructions,
      });
    }
  }, [settings, form]);

  function toggleMode(
    field: "allow_gmeet" | "allow_on_campus",
    current: boolean,
  ) {
    update(
      { [field]: !current },
      { onSuccess: () => toast.success("Interview settings updated") },
    );
  }

  function onSubmit(values: SettingsFormValues) {
    update(
      {
        gmeet: {
          heading: values.gmeetHeading,
          description: values.gmeetDescription,
          instructions: values.gmeetInstructions,
        },
        on_campus: {
          heading: values.onCampusHeading,
          description: values.onCampusDescription,
          instructions: values.onCampusInstructions,
        },
      },
      { onSuccess: () => toast.success("Interview settings updated") },
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Allowed Interview Modes</h2>
          <p className="text-sm text-muted-foreground">
            Turn a mode off to stop new slots from being created for it.
            Existing slots of that mode aren&apos;t affected.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={settings.allowGmeet ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() => toggleMode("allow_gmeet", settings.allowGmeet)}
          >
            Google Meet — {settings.allowGmeet ? "Enabled" : "Disabled"}
          </Button>
          <Button
            type="button"
            variant={settings.allowOnCampus ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() =>
              toggleMode("allow_on_campus", settings.allowOnCampus)
            }
          >
            On Campus — {settings.allowOnCampus ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Interview Instructions</h2>
          <p className="text-sm text-muted-foreground">
            Separate instructions for online and on-campus interviews — shown to
            every student booking that mode.
          </p>
        </div>

        <ModeInstructionsBlock
          title="Online (Google Meet)"
          description="e.g. test your mic/camera, join 5 minutes early."
          headingField="gmeetHeading"
          descriptionField="gmeetDescription"
          instructionsField="gmeetInstructions"
          form={form}
        />

        <ModeInstructionsBlock
          title="Offline (On Campus)"
          description="e.g. bring a photo ID, report to the front desk."
          headingField="onCampusHeading"
          descriptionField="onCampusDescription"
          instructionsField="onCampusInstructions"
          form={form}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
