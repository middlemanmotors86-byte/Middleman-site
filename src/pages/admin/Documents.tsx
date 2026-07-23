import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  Trash2, 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Loader2,
  Plus
} from "lucide-react";
import { format } from "date-fns";

interface DocumentUpload {
  id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  contact_submission_id: string | null;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return FileSpreadsheet;
  if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word, Excel, or image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `admin-documents/${timestamp}-${sanitizedName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Insert record
      const { error: insertError } = await supabase
        .from('document_uploads')
        .insert({
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          description: description.trim() || null,
        });

      if (insertError) {
        // Clean up uploaded file if record insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw insertError;
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });

      setDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentUpload) => {
    setIsDeleting(doc.id);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('document_uploads')
        .delete()
        .eq('id', doc.id);

      if (deleteError) throw deleteError;

      setDocuments(docs => docs.filter(d => d.id !== doc.id));

      toast({
        title: "Document deleted",
        description: "The document has been deleted",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (doc: DocumentUpload) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground">
              Manage uploaded documents and files
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document to your admin files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={ALLOWED_MIME_TYPES.join(',')}
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF, Word, Excel, Images up to 20MB
                  </p>
                </div>
                {selectedFile && (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                    maxLength={500}
                  />
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Georgia Sales Jacket Checklist */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Georgia Sales Jacket — Required Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Per the Georgia Board of Used Motor Vehicle Dealers & Parts Dealers, every vehicle sale must include a complete sales jacket with the following:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
              {[
                { label: "Bill of Sale (T-7 Form)", desc: "Signed by both buyer and dealer with full sale details" },
                { label: "Title or Title Application", desc: "Original title assigned to buyer, or MV-1 title application if title is pending" },
                { label: "Odometer Disclosure (T-8 Form)", desc: "Federal requirement for vehicles under 20 years old — signed by both parties" },
                { label: "Buyer's Guide (FTC)", desc: "\"As-Is\" or warranty window sticker — must be signed by the buyer" },
                { label: "Security Agreement / Finance Contract", desc: "Required if vehicle is financed — includes APR, terms, and payment schedule" },
                { label: "Tag & Title Receipt (MV-18G)", desc: "Proof that tag and title fees were collected or processed" },
                { label: "Copy of Buyer's Driver License", desc: "Valid Georgia or out-of-state license — verify identity and address" },
                { label: "Proof of Insurance", desc: "Buyer must show valid insurance before delivery" },
                { label: "Vehicle History Report", desc: "AutoCheck or Carfax — recommended to disclose known history" },
                { label: "Emissions Inspection Certificate", desc: "Required in metro-Atlanta counties — must be current at time of sale" },
                { label: "Dealer Reassignment Form (T-11)", desc: "Used when a dealer assigns title to another party or when title was dealer-reassigned" },
                { label: "Power of Attorney (T-8 POA)", desc: "If someone other than the buyer is handling title work on their behalf" },
                { label: "Lien Release / Payoff Letter", desc: "Required if vehicle had an existing lien — proof it's been cleared" },
                { label: "Sales Tax Documentation", desc: "Proof of TAVT (Title Ad Valorem Tax) payment or exemption" },
                { label: "Delivery Confirmation / Receipt", desc: "Signed acknowledgment that the buyer received the vehicle and all documents" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Keep all sales jacket documents on file for a minimum of 3 years as required by Georgia law. Upload copies here for secure digital backup.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const Icon = getFileIcon(doc.mime_type);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {doc.file_name}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                        <TableCell>
                          {doc.contact_submission_id ? (
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              Contact Form
                            </span>
                          ) : (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Admin Upload
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc)}
                              disabled={isDeleting === doc.id}
                            >
                              {isDeleting === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDocuments;
