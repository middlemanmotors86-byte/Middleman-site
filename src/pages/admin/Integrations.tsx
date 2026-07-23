import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Send, ExternalLink } from "lucide-react";

const KEYS = [
  { key: "GOOGLE_SHEETS_ID", label: "Google Sheets ID", hint: "The ID from the sheet URL (between /d/ and /edit)." },
  { key: "GA_MEASUREMENT_ID", label: "GA4 Measurement ID", hint: "Format: G-XXXXXXXXXX (optional — for gtag mirroring)." },
];

export default function AdminIntegrations() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("integration_settings").select("*");
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[(row as any).key] = (row as any).value ?? "";
      setValues(map);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("integration_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const testDigest = async () => {
    setSending(true);
    const { error } = await supabase.functions.invoke("daily-lead-digest", { body: {} });
    setSending(false);
    if (error) toast.error("Digest failed — check RESEND_API_KEY");
    else toast.success("Digest sent to middlemanmotors86@gmail.com");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Google Sheets, GA4, and daily digest.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Keys are read by edge functions at runtime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {KEYS.map(({ key, label, hint }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={hint}
                />
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
            <Button onClick={save} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Lead Digest</CardTitle>
            <CardDescription>
              Sends a 24-hour summary of leads, credit apps, funnel events and email captures to <b>middlemanmotors86@gmail.com</b>.
              Requires <code>RESEND_API_KEY</code> to be set.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testDigest} disabled={sending} variant="outline">
              <Send className="w-4 h-4 mr-1" /> {sending ? "Sending…" : "Send test digest now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Sheets sync</CardTitle>
            <CardDescription>
              Every new lead / credit app is appended to the sheet above. Connect the Google Sheets connector, then paste the sheet ID here.
              Give edit access to the connector's Google account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Create a new sheet <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
