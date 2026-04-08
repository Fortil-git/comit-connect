import { useEffect, useRef, useState, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Upload, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, attachments: Attachment[]) => void;
  placeholder?: string;
  disabled?: boolean;
  attachments?: Attachment[];
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Saisissez vos notes ici...", 
  disabled = false,
  attachments = []
}: RichTextEditorProps) => {
  const quillRef = useRef<any>(null);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);
  const [isMounted, setIsMounted] = useState(false);

  // Mémoriser les modules et formats AVANT tout return conditionnel
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ]
    }
  }), []);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ], []);

  useEffect(() => {
    setIsMounted(true);
    setLocalAttachments(attachments);
  }, [attachments]);

  // Return conditionnel APRÈS tous les hooks
  if (!isMounted) {
    return <div className="min-h-[200px] bg-muted animate-pulse rounded-md" />;
  }

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const quill = quillRef.current?.getEditor?.();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', base64);
          quill.setSelection(range.index + 1, 0);
        }
        toast.success("Image ajoutée avec succès");
      };
      reader.readAsDataURL(file);
    };
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.pdf,.doc,.docx,.xls,.xlsx,.txt');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64
        };
        
        const newAttachments = [...localAttachments, attachment];
        setLocalAttachments(newAttachments);
        onChange(value, newAttachments);
        toast.success(`Fichier "${file.name}" ajouté`);
      };
      reader.readAsDataURL(file);
    };
  };

  const handleRemoveAttachment = (id: string) => {
    const newAttachments = localAttachments.filter(att => att.id !== id);
    setLocalAttachments(newAttachments);
    onChange(value, newAttachments);
    toast.success("Fichier supprimé");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div className={`rich-text-editor border rounded-md ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={(content) => onChange(content, localAttachments)}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className="bg-background"
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleImageUpload}
          disabled={disabled}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Ajouter une image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileAttachment}
          disabled={disabled}
          className="gap-2"
        >
          <Paperclip className="w-4 h-4" />
          Joindre un fichier
        </Button>
      </div>

      {localAttachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Fichiers joints ({localAttachments.length})</p>
          <div className="space-y-2">
            {localAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Paperclip className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  disabled={disabled}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
