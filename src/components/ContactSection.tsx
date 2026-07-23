import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { contactFormSchema, type ContactFormData } from "@/lib/validations/contact";
import FileUpload from "@/components/FileUpload";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const validateForm = (): boolean => {
    const result = contactFormSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ContactFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData if there are files, otherwise use JSON
      if (attachedFiles.length > 0) {
        const formDataPayload = new FormData();
        formDataPayload.append('name', formData.name.trim());
        formDataPayload.append('email', formData.email.trim());
        if (formData.phone?.trim()) {
          formDataPayload.append('phone', formData.phone.trim());
        }
        formDataPayload.append('message', formData.message.trim());
        
        // Add files
        for (const file of attachedFiles) {
          formDataPayload.append('files', file);
        }

        // Use fetch directly for FormData
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/submit-contact`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: formDataPayload,
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 429) {
            toast({
              title: "Too Many Requests",
              description: "Please wait a few minutes before submitting again.",
              variant: "destructive",
            });
            return;
          }
          throw new Error(data.error || 'Failed to submit');
        }
      } else {
        // Use rate-limited edge function for JSON (no files)
        const response = await supabase.functions.invoke('submit-contact', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone?.trim() || null,
            message: formData.message.trim(),
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to submit');
        }

        // Check for rate limit error
        if (response.data?.error) {
          if (response.data.retryAfter) {
            toast({
              title: "Too Many Requests",
              description: "Please wait a few minutes before submitting again.",
              variant: "destructive",
            });
            return;
          }
          throw new Error(response.data.error);
        }
      }

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setAttachedFiles([]);
      setErrors({});
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["1970 Main St East, Suite B12", "Snellville, GA 30078"],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["(770) 676-0367", "Mon-Sat: 9AM-7PM"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["jscg@middlemanmotors.store"],
    },
    {
      icon: Clock,
      title: "Hours",
      details: ["Mon-Sat: 9AM - 7PM", "Sunday: Closed"],
    },
  ];

  return (
    <section id="contact" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Let's Find Your <span className="text-gradient-gold">Perfect Car</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions? Ready to schedule a test drive? We're here to help. 
            No pressure, just friendly conversation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {contactInfo.map((info, index) => (
              <Card
                key={info.title}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {info.title}
                    </h4>
                    {info.details.map((detail) => (
                      <p key={detail} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-6">
                Send Us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Your Name
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value.trimStart() })
                      }
                      className={`bg-secondary border-border ${errors.name ? "border-destructive" : ""}`}
                      required
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value.trim() })
                      }
                      className={`bg-secondary border-border ${errors.email ? "border-destructive" : ""}`}
                      required
                      maxLength={255}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => {
                      // Allow numbers, +, and basic formatting characters, but sanitize for storage
                      const sanitized = e.target.value.replace(/[^0-9+()-]/g, '');
                      setFormData({ ...formData, phone: sanitized });
                    }
                    }
                    className={`bg-secondary border-border ${errors.phone ? "border-destructive" : ""}`}
                    maxLength={20}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    How Can We Help?
                  </label>
                  <Textarea
                    placeholder="I'm interested in a reliable family sedan..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`bg-secondary border-border min-h-[120px] ${errors.message ? "border-destructive" : ""}`}
                    required
                    maxLength={1000}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Attachments (optional)
                  </label>
                  <FileUpload
                    files={attachedFiles}
                    onFilesChange={setAttachedFiles}
                    maxFiles={5}
                    disabled={isSubmitting}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="gold" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>        
      </div>
    </section>
  );
};

export default ContactSection;
