"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api-service";

type Project = { _id: string; name: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  storageKey?: string;
  placeholder?: string;
  includeAll?: boolean;
};

export default function ProjectFilter({
  value,
  onChange,
  storageKey = "businessProjectId",
  placeholder = "Select project",
  includeAll = false,
}: Props) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (stored && !value) {
      onChange(stored);
    }
  }, [onChange, storageKey, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(storageKey, value);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, value]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getProjects();
        setProjects(data || []);
        if (!value && !includeAll && data?.length) {
          onChange(data[0]._id);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
      }
    };
    load();
  }, [includeAll, onChange, value]);

  const internalValue =
    includeAll && !value ? "__all__" : value || "";

  return (
    <Select
      value={internalValue}
      onValueChange={(next) => {
        if (includeAll && next === "__all__") {
          onChange("");
          return;
        }
        onChange(next);
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="__all__">All Projects</SelectItem>}
        {projects.map((project) => (
          <SelectItem key={project._id} value={project._id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
