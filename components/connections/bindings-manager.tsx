"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  createBindingAction,
  deleteBindingAction,
  saveBindingAction,
  testBindingAction,
} from "@/app/(admin)/connections/[id]/binding-actions";
import type { FieldDescriptor } from "@/lib/connections/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";

export type Placeholder = { key: string; kind: "text" | "image" };
export type TemplateOption = {
  id: string;
  name: string;
  placeholders: Placeholder[];
};
export type BindingData = {
  id: string;
  templateId: string;
  fieldMap: Record<string, string>;
  defaults: Record<string, string>;
  active: boolean;
};

export function BindingsManager({
  connectionId,
  fields,
  templates,
  bindings,
}: {
  connectionId: string;
  fields: FieldDescriptor[];
  templates: TemplateOption[];
  bindings: BindingData[];
}) {
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Add a binding for template
          </Label>
          <Select
            value={templateId}
            onValueChange={(v) => v && setTemplateId(v)}
          >
            <SelectTrigger size="sm" className="w-64">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!templateId || pending}
          onClick={() =>
            start(async () => {
              await createBindingAction(connectionId, templateId);
              toast.success("Binding added");
            })
          }
        >
          <Plus className="size-4" /> Add binding
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create a template first, then bind its placeholders to fields here.
        </p>
      ) : null}

      {bindings.map((b) => {
        const template = templates.find((t) => t.id === b.templateId);
        return (
          <BindingEditor
            key={b.id}
            connectionId={connectionId}
            binding={b}
            template={template}
            fields={fields}
          />
        );
      })}
    </div>
  );
}

function BindingEditor({
  connectionId,
  binding,
  template,
  fields,
}: {
  connectionId: string;
  binding: BindingData;
  template: TemplateOption | undefined;
  fields: FieldDescriptor[];
}) {
  const [fieldMap, setFieldMap] = useState<Record<string, string>>(
    binding.fieldMap ?? {},
  );
  const [defaults, setDefaults] = useState<Record<string, string>>(
    binding.defaults ?? {},
  );
  const [active, setActive] = useState(binding.active);
  const [pending, start] = useTransition();

  if (!template) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Template was deleted.
          </span>
          <DeleteBindingButton connectionId={connectionId} id={binding.id} />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="font-medium">{template.name}</div>
        <div className="flex items-center gap-3">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            Active
            <Switch checked={active} onCheckedChange={setActive} />
          </Label>
          <DeleteBindingButton connectionId={connectionId} id={binding.id} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {template.placeholders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This template has no placeholders.
          </p>
        ) : (
          template.placeholders.map((ph) => {
            const options = fields.filter((f) => f.kind === ph.kind);
            const usable = options.length > 0 ? options : fields;
            return (
              <div
                key={ph.key}
                className="grid grid-cols-[1fr_1fr_1fr] items-center gap-2"
              >
                <div className="text-sm">
                  {ph.key}
                  <span className="ml-1 text-xs text-muted-foreground">
                    · {ph.kind}
                  </span>
                </div>
                <Select
                  value={fieldMap[ph.key] ?? NONE}
                  onValueChange={(v) => {
                    setFieldMap((prev) => {
                      const next = { ...prev };
                      if (!v || v === NONE) delete next[ph.key];
                      else next[ph.key] = v;
                      return next;
                    });
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— none —</SelectItem>
                    {usable.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={defaults[ph.key] ?? ""}
                  placeholder="Default value"
                  className="h-8"
                  onChange={(e) =>
                    setDefaults((prev) => ({
                      ...prev,
                      [ph.key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          })
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await testBindingAction(connectionId, binding.id);
                toast.success("Test render created — see Recent renders");
              })
            }
          >
            Test render
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await saveBindingAction({
                  id: binding.id,
                  connectionId,
                  fieldMap,
                  defaults,
                  active,
                });
                toast.success("Binding saved");
              })
            }
          >
            {pending ? "Saving…" : "Save binding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteBindingButton({
  connectionId,
  id,
}: {
  connectionId: string;
  id: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      disabled={pending}
      aria-label="Delete binding"
      onClick={() => {
        if (!window.confirm("Delete this binding?")) return;
        start(() => {
          void deleteBindingAction(connectionId, id);
        });
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
