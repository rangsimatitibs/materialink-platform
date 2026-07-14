import { Navigate, useParams } from "react-router-dom";
import CrudPage from "./CrudPage";
import { CRUD_CONFIGS } from "./crudConfigs";

export default function CrudResourcePage() {
  const { resource } = useParams<{ resource: string }>();
  const config = resource ? CRUD_CONFIGS[resource] : undefined;
  if (!config) return <Navigate to="/admin" replace />;
  return <CrudPage key={resource} config={config} />;
}