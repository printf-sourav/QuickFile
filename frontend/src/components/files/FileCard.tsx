import { File, Trash2, Download } from 'lucide-react';
import CustomCard from '@/components/common/CustomCard';
import api from '@/lib/axios';
import CustomButton from '@/components/common/CustomButton';
import ExpiryTimer from './ExpiryTimer';
import toast from 'react-hot-toast';

interface FileCardProps {
  file: {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    url: string;
    expiresAt: string;
  };
  onDelete: (id: string) => void;
}

const FileCard = ({ file, onDelete }: FileCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Copy link removed per request.

  const handleDirectDownload = async () => {
    try {
      const url = `${api.defaults.baseURL}/files/direct-download/${file.id}`;
      
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = file.originalName || file.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Network error while downloading');
      }
    }
  };

  return (
    <CustomCard hover className="group">
      <div className="flex items-start gap-4">
        {}
        <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          <File className="w-6 h-6 text-primary" />
        </div>

        {}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">
            {file.originalName}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {formatFileSize(file.size)}
          </p>
          
          {}
          <ExpiryTimer expiresAt={file.expiresAt} />
        </div>

        {}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <CustomButton
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDirectDownload}
          >
            Download
          </CustomButton>
          <CustomButton
            variant="destructive"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(file.id)}
          >
            Delete
          </CustomButton>
        </div>
      </div>
    </CustomCard>
  );
};

export default FileCard;
