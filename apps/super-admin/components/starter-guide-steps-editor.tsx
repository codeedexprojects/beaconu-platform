"use client";

import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { StarterGuideStep } from "@beaconu/types";

interface StarterGuideStepsEditorProps {
  steps: StarterGuideStep[];
  onChange: (steps: StarterGuideStep[]) => void;
}

/** Repeatable, order-by-array-position step editor: title + description per step. */
export function StarterGuideStepsEditor({
  steps,
  onChange,
}: StarterGuideStepsEditorProps) {
  function addStep() {
    onChange([...steps, { title: "", description: "" }]);
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function updateStep(
    index: number,
    field: keyof StarterGuideStep,
    value: string,
  ) {
    onChange(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Steps (in order)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          className="h-7 gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No steps yet — click Add Step.
        </p>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-2 rounded-lg border p-3 items-start"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
                <GripVertical className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold ml-0.5">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => updateStep(index, "title", e.target.value)}
                />
                <Textarea
                  placeholder="Step description"
                  value={step.description}
                  onChange={(e) =>
                    updateStep(index, "description", e.target.value)
                  }
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeStep(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
