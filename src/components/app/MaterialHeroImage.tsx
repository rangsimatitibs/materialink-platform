import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

const BUCKET = "material-images";

function publicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
function pathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length);
}

export default function MaterialHeroImage({
  materialId,
  imageUrl,
  materialName,
  onChange,
}: {
  materialId: string;
  imageUrl: string | null;
  materialName: string;
  onChange?: (url: string | null) => void;
}) {
  const { isAdmin } = useAuth();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `general/${materialId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        return;
      }
      const url = publicUrl(path);
      // Remove previous
      if (imageUrl) {
        const prev = pathFromUrl(imageUrl);
        if (prev) await supabase.storage.from(BUCKET).remove([prev]);
      }
      const { error } = await supabase
        .from("general_materials")
        .update({ image_url: url })
        .eq("id", materialId);
      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }
      onChange?.(url);
      toast({ title: "Image updated" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!imageUrl) return;
    setBusy(true);
    try {
      const prev = pathFromUrl(imageUrl);
      if (prev) await supabase.storage.from(BUCKET).remove([prev]);
      await supabase.from("general_materials").update({ image_url: null }).eq("id", materialId);
      onChange?.(null);
    } finally {
      setBusy(false);
    }
  };

  if (!imageUrl && !isAdmin) return null;

  return (
    <div className="relative w-full aspect-[16/6] rounded-2xl overflow-hidden border bg-muted">
      {imageUrl ? (
        <img src={imageUrl} alt={materialName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          No image yet
        </div>
      )}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {imageUrl ? "Replace" : "Upload"}
          </Button>
          {imageUrl && (
            <Button size="sm" variant="destructive" className="gap-1" disabled={busy} onClick={remove}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}