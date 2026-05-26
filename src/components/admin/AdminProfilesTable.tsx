"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Check, ShieldAlert, X, Search, ShieldCheck } from "lucide-react";

export function AdminProfilesTable() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "pendientes" | "aprobados">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch profiles from Supabase
  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false } as any); // Fallback order if created_at is not present

    if (error) {
      console.error("Error fetching profiles:", error.message);
      // Fallback: If query fails, let's select without ordering
      const { data: rawData, error: rawError } = await supabase.from("profiles").select("*");
      if (!rawError) {
        setProfiles(rawData || []);
      }
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update approved status in Supabase
  const handleToggleApproval = async (profileId: string, currentStatus: boolean) => {
    setActionLoading(profileId);
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from("profiles")
      .update({ approved: newStatus })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating profile status:", error.message);
      alert("Hubo un error al actualizar el acceso: " + error.message);
    } else {
      // Update local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, approved: newStatus } : p))
      );
    }
    setActionLoading(null);
  };

  // Filter & Search logic
  const filteredProfiles = profiles.filter((p) => {
    // 1. Filter by status
    if (filter === "pendientes" && p.approved !== false) return false;
    if (filter === "aprobados" && p.approved !== true) return false;

    // 2. Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = p.full_name?.toLowerCase().includes(query);
      const emailMatch = p.email?.toLowerCase().includes(query);
      const roleMatch = p.role?.toLowerCase().includes(query);
      return nameMatch || emailMatch || roleMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Search Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Filters */}
        <div className="flex gap-2 rounded-lg bg-secondary p-1 text-sm">
          <button
            onClick={() => setFilter("todos")}
            className={`rounded-md px-4 py-2 font-bold transition-all ${
              filter === "todos" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-navy"
            }`}
          >
            Todos ({profiles.length})
          </button>
          <button
            onClick={() => setFilter("pendientes")}
            className={`rounded-md px-4 py-2 font-bold transition-all ${
              filter === "pendientes" ? "bg-white text-amber-600 shadow-sm" : "text-muted-foreground hover:text-navy"
            }`}
          >
            Pendientes ({profiles.filter((p) => p.approved === false).length})
          </button>
          <button
            onClick={() => setFilter("aprobados")}
            className={`rounded-md px-4 py-2 font-bold transition-all ${
              filter === "aprobados" ? "bg-white text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-navy"
            }`}
          >
            Aprobados ({profiles.filter((p) => p.approved === true).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex h-11 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-white px-3 text-muted-foreground shadow-sm">
          <Search className="h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:text-muted-foreground/80"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-black">Nombre Completo</th>
              <th className="px-4 py-4 font-black">Correo Electrónico</th>
              <th className="px-4 py-4 font-black">Rol Solicitado</th>
              <th className="px-4 py-4 font-black">Estado de Acceso</th>
              <th className="px-6 py-4 font-black text-right">Acciones de Aprobación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Cargando usuarios registrados...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold">
                  No se encontraron usuarios en esta lista.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((p) => {
                const isApproved = p.approved === true;
                const isPending = p.approved === false;
                const isUserAdmin = p.role === "admin";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 font-black text-primary">
                          {p.full_name ? p.full_name[0].toUpperCase() : "U"}
                        </span>
                        <div>
                          <p className="font-black text-navy">{p.full_name || "Sin nombre"}</p>
                          <p className="text-xs text-muted-foreground">ID: {p.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 font-semibold text-slate-600">{p.email}</td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold capitalize ${
                        p.role === "admin"
                          ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10"
                          : p.role === "proveedor"
                          ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                          : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                      }`}>
                        {p.role || "Emprendedor"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                          <Check className="h-3 w-3" />
                          Aprobado
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                          <ShieldAlert className="h-3 w-3" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-600/10">
                          Desconocido (Activo)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {isUserAdmin ? (
                        <span className="text-xs font-bold text-muted-foreground/80 italic">
                          Admin auto-aprobado
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {isPending ? (
                            <Button
                              size="sm"
                              onClick={() => handleToggleApproval(p.id, false)}
                              disabled={actionLoading === p.id}
                              className="bg-emerald-600 font-bold hover:bg-emerald-700 text-white flex items-center gap-1.5"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              {actionLoading === p.id ? "Procesando..." : "Aprobar Acceso"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleApproval(p.id, true)}
                              disabled={actionLoading === p.id}
                              className="border-red-200 text-red-600 font-bold hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
                            >
                              <X className="h-4 w-4" />
                              {actionLoading === p.id ? "Procesando..." : "Pausar Acceso"}
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
