"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type AdminProject } from "@/lib/admin/client";
import { ProjectForm } from "@/components/admin/project-form";
import { ErrorNote, Loading } from "@/components/admin/ui";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<AdminProject>(`/admin/projects/${id}`)
      .then(setProject)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <ErrorNote message={error} />;
  if (!project) return <Loading />;
  return <ProjectForm initial={project} />;
}
