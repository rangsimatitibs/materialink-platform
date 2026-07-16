import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Photo = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

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

export function GradePhotosGallery({ gradeId }: { gradeId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("supplier_grade_images")
        .select("id, image_url, caption, sort_order")
        .eq("grade_id", gradeId)
        .order("sort_order", { ascending: true });
      setPhotos((data as Photo[]) || []);
    })();
  }, [gradeId]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-2">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreview(p.image_url)}
            className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted hover:opacity-90"
          >
            <img src={p.image_url} alt={p.caption ?? "Grade photo"} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl p-2">
          {preview && <img src={preview} alt="Grade photo" className="w-full h-auto rounded" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GradePhotosManager({
  gradeId,
  companyId,
  triggerLabel = "Photos",
}: {
  gradeId: string;
  companyId: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("supplier_grade_images")
      .select("id, image_url, caption, sort_order")
      .eq("grade_id", gradeId)
      .order("sort_order", { ascending: true });
    setPhotos((data as Photo[]) || []);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, gradeId]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      let idx = photos.length;
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${companyId}/grade/${gradeId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
          continue;
        }
        const url = publicUrl(path);
        const { error: insErr } = await supabase.from("supplier_grade_images").insert({
          grade_id: gradeId,
          image_url: url,
          sort_order: idx++,
        });
        if (insErr) {
          toast({ title: "Save failed", description: insErr.message, variant: "destructive" });
        }
      }
      await load();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (photo: Photo) => {
    const path = pathFromUrl(photo.image_url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    const { error } = await supabase.from("supplier_grade_images").delete().eq("id", photo.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    await load();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <ImagePlus className="h-3.5 w-3.5" /> {triggerLabel} ({photos.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grade photos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-6 cursor-pointer hover:bg-muted/40 text-sm text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" /> Click to upload photos (multiple allowed)
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => upload(e.target.files)}
            />
          </label>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="relative group aspect-square rounded-md overflow-hidden border">
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}