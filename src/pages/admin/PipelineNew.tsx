import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Sparkles, Car, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDMSInventory } from "@/hooks/useDMSInventory";
import { smartMatchVehicles, IntakeAnswers } from "@/lib/intakeMatching";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DMSVehicle } from "@/lib/dms";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const BODY_STYLES = [
  { value: "Sedan", label: "Sedan", emoji: "🚗" },
  { value: "SUV", label: "SUV", emoji: "🚙" },
  { value: "Truck", label: "Truck", emoji: "🛻" },
  { value: "Coupe", label: "Coupe", emoji: "🏎️" },
  { value: "Van", label: "Minivan", emoji: "🚐" },
  { value: "Hatchback", label: "Hatchback", emoji: "🚕" },
];

const FINANCING = [
  { value: "cash", label: "Paying cash" },
  { value: "finance", label: "Financing through us" },
  { value: "bhph", label: "Buy here, pay here" },
  { value: "trade_in", label: "Has a trade-in" },
];

const TIMELINE = [
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "browsing", label: "Just exploring" },
];

interface FormState {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  desired_year: string;
  desired_make: string;
  desired_model: string;
  body_style: string;
  flexible_on_model: boolean;
  budget_min: number;
  budget_max: number;
  financing_preference: string;
  timeline: string;
  notes: string;
}

const initialState: FormState = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  desired_year: "",
  desired_make: "",
  desired_model: "",
  body_style: "",
  flexible_on_model: false,
  budget_min: 5000,
  budget_max: 25000,
  financing_preference: "",
  timeline: "",
  notes: "",
};

const PipelineNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: dmsData, isLoading: invLoading } = useDMSInventory();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [matches, setMatches] = useState<DMSVehicle[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const computedMatches = useMemo(() => {
    if (!dmsData?.vehicles?.length) return [];
    const answers: IntakeAnswers = {
      desired_year: form.desired_year || undefined,
      desired_make: form.desired_make || undefined,
      desired_model: form.desired_model || undefined,
      body_style: form.body_style || undefined,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      flexible_on_model: form.flexible_on_model,
    };
    return smartMatchVehicles(dmsData.vehicles, answers, 3);
  }, [dmsData?.vehicles, form]);

  const goNext = () => {
    if (step === 0 && !form.customer_name.trim()) {
      toast({ title: "Customer name required", variant: "destructive" });
      return;
    }
    if (step === 4) {
      // moving into matches step — compute
      setMatches(computedMatches);
    }
    setStep((s) => Math.min(5, s + 1) as Step);
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1) Create the deal first so we can link it
      const { data: deal, error: dealError } = await supabase
        .from("deals")
        .insert({
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          customer_email: form.customer_email || null,
          stage: "inquiry",
          notes: [
            form.notes,
            form.financing_preference && `Financing: ${form.financing_preference}`,
            form.timeline && `Timeline: ${form.timeline}`,
            (form.desired_year || form.desired_make || form.desired_model) &&
              `Wants: ${form.desired_year} ${form.desired_make} ${form.desired_model}`.trim(),
            (form.budget_min || form.budget_max) &&
              `Budget: $${form.budget_min.toLocaleString()} – $${form.budget_max.toLocaleString()}`,
            matches.length &&
              `Matched: ${matches.map((m) => m.name).join(" | ")}`,
          ]
            .filter(Boolean)
            .join("\n"),
          // If they're locked in on one vehicle and we found a perfect match, prefill it
          vehicle_year:
            matches[0] && form.desired_year ? String(matches[0].year) : null,
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // 2) Save the questionnaire submission, linked to the deal
      const { error: subError } = await supabase
        .from("questionnaire_submissions")
        .insert({
          created_by: user?.id ?? null,
          desired_year: form.desired_year || null,
          desired_make: form.desired_make || null,
          desired_model: form.desired_model || null,
          body_style: form.body_style || null,
          flexible_on_model: form.flexible_on_model,
          budget_min: form.budget_min,
          budget_max: form.budget_max,
          financing_preference: form.financing_preference || null,
          timeline: form.timeline || null,
          notes: form.notes || null,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          customer_email: form.customer_email || null,
          matched_stock_numbers: matches
            .map((m) => m.stockNumber)
            .filter((s): s is string => Boolean(s)),
          inventory_source: "automanager",
          linked_deal_id: deal.id,
        });

      if (subError) throw subError;

      toast({
        title: "Intake saved!",
        description: `${form.customer_name} added to the pipeline.`,
      });
      navigate("/admin/pipeline");
    } catch (e) {
      console.error(e);
      toast({
        title: "Could not save intake",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    "Who's the customer?",
    "What car are they looking for?",
    "What's their budget?",
    "How are they paying?",
    "When are they buying?",
    "Here are 3 matches from inventory",
  ];

  const stepSubtitles = [
    "Quick contact info to start the file.",
    "Year, make, model — or just a body style if they're flexible.",
    "Slide to the range that feels comfortable for them.",
    "Helps us route the right financing options.",
    "Sets the urgency on the pipeline.",
    "Pulled live from AutoManager inventory.",
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/pipeline")}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to pipeline
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              New customer intake
            </h1>
            <p className="text-muted-foreground mt-1">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Phone intake
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">{stepTitles[step]}</CardTitle>
            <CardDescription>{stepSubtitles[step]}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full name *</Label>
                      <Input
                        id="name"
                        value={form.customer_name}
                        onChange={(e) => update("customer_name", e.target.value)}
                        placeholder="Jane Doe"
                        autoFocus
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.customer_phone}
                          onChange={(e) => update("customer_phone", e.target.value)}
                          placeholder="(770) 555-0123"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.customer_email}
                          onChange={(e) => update("customer_email", e.target.value)}
                          placeholder="jane@email.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          inputMode="numeric"
                          maxLength={4}
                          value={form.desired_year}
                          onChange={(e) => update("desired_year", e.target.value)}
                          placeholder="2021"
                        />
                      </div>
                      <div>
                        <Label htmlFor="make">Make</Label>
                        <Input
                          id="make"
                          value={form.desired_make}
                          onChange={(e) => update("desired_make", e.target.value)}
                          placeholder="Honda"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={form.desired_model}
                          onChange={(e) => update("desired_model", e.target.value)}
                          placeholder="Accord"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="flex"
                        checked={form.flexible_on_model}
                        onCheckedChange={(v) => update("flexible_on_model", Boolean(v))}
                      />
                      <Label htmlFor="flex" className="cursor-pointer font-normal">
                        Open to similar vehicles
                      </Label>
                    </div>

                    <div>
                      <Label className="mb-2 block">Body style (optional)</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {BODY_STYLES.map((b) => (
                          <button
                            type="button"
                            key={b.value}
                            onClick={() =>
                              update(
                                "body_style",
                                form.body_style === b.value ? "" : b.value
                              )
                            }
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              form.body_style === b.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="text-2xl">{b.emoji}</div>
                            <div className="text-xs mt-1">{b.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold tracking-tight">
                        ${form.budget_min.toLocaleString()} –{" "}
                        ${form.budget_max.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll show options across this range — no pressure.
                      </p>
                    </div>

                    <div className="space-y-6 px-2">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <Label>Minimum</Label>
                          <span className="text-muted-foreground">
                            ${form.budget_min.toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          min={2000}
                          max={50000}
                          step={500}
                          value={[form.budget_min]}
                          onValueChange={(v) => {
                            const next = v[0];
                            update("budget_min", next);
                            if (next > form.budget_max) update("budget_max", next);
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <Label>Maximum</Label>
                          <span className="text-muted-foreground">
                            ${form.budget_max.toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          min={2000}
                          max={75000}
                          step={500}
                          value={[form.budget_max]}
                          onValueChange={(v) => {
                            const next = v[0];
                            update("budget_max", next);
                            if (next < form.budget_min) update("budget_min", next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <RadioGroup
                    value={form.financing_preference}
                    onValueChange={(v) => update("financing_preference", v)}
                    className="space-y-2"
                  >
                    {FINANCING.map((f) => (
                      <label
                        key={f.value}
                        htmlFor={`fin-${f.value}`}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          form.financing_preference === f.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem id={`fin-${f.value}`} value={f.value} />
                        <span className="font-medium">{f.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <RadioGroup
                      value={form.timeline}
                      onValueChange={(v) => update("timeline", v)}
                      className="grid grid-cols-3 gap-3"
                    >
                      {TIMELINE.map((t) => (
                        <label
                          key={t.value}
                          htmlFor={`tl-${t.value}`}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            form.timeline === t.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem id={`tl-${t.value}`} value={t.value} className="sr-only" />
                          <span className="font-medium text-center">{t.label}</span>
                        </label>
                      ))}
                    </RadioGroup>

                    <div>
                      <Label htmlFor="notes">Anything else? (optional)</Label>
                      <Textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Trade-in details, must-haves, color preference, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    {invLoading ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading inventory…
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="text-center py-12">
                        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          No vehicles in inventory matched. We'll still save the lead.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Showing {matches.length} of your best in-stock options.
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMatches(computedMatches)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {matches.map((v) => (
                            <div
                              key={v.id}
                              className="flex gap-4 p-3 rounded-lg border bg-card"
                            >
                              <img
                                src={v.image}
                                alt={v.name}
                                className="w-28 h-20 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{v.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {v.year} · {v.mileage} mi · {v.fuel}
                                </p>
                                {v.badge && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {v.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goBack} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step < 5 ? (
            <Button onClick={goNext}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Save to pipeline
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PipelineNew;
