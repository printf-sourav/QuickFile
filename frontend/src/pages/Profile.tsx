import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';
import CustomButton from '@/components/common/CustomButton';

interface Stats {
  totalFiles: number;
  totalDownloads: number;
  totalStorageUsed: string; 
  mostDownloadedFile?: { filename: string; downloadCount: number } | null;
}

const parseMb = (val?: string) => {
  if (!val) return 0;
  const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
};

const Profile = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/stats');
        if (!mounted) return;
        setStats(res.data?.data || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load stats');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const usedMb = parseMb(stats?.totalStorageUsed);
  const percent = Math.min(100, (usedMb / 100) * 100);
  let barColor = 'bg-primary';
  if (percent > 80) barColor = 'bg-red-500';
  else if (percent > 60) barColor = 'bg-yellow-500';

  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/files"><CustomButton variant="outline" size="sm">My Files</CustomButton></Link>
            <Link to="/"><CustomButton variant="ghost" size="sm">Home</CustomButton></Link>
          </div>
        </div>

        {loading && (
          <div className="text-muted-foreground">Loading stats…</div>
        )}
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {stats && (
          <div className="space-y-6">
            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border p-5 bg-card/50 shadow-sm">
                <div className="text-xs text-muted-foreground">Total Files</div>
                <div className="text-3xl font-bold mt-1">{stats.totalFiles}</div>
              </div>
              <div className="rounded-xl border border-border p-5 bg-card/50 shadow-sm">
                <div className="text-xs text-muted-foreground">Total Downloads</div>
                <div className="text-3xl font-bold mt-1">{stats.totalDownloads}</div>
              </div>
              <div className="rounded-xl border border-border p-5 bg-card/50 shadow-sm">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Storage Used</span>
                  <span className="text-[10px] uppercase tracking-wide">Max 100MB</span>
                </div>
                <div className="text-3xl font-bold mt-1">{stats.totalStorageUsed}</div>
              </div>
            </div>

            {}
            <div className="rounded-xl border border-border p-5 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Quota Usage</span>
                <span className="text-sm font-medium">{stats.totalStorageUsed} / 100 MB</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-primary/20 shadow-inner">
                <div className={`h-full ${barColor} transition-all`} style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-right">{percent.toFixed(0)}%</div>
            </div>

            {}
            {stats.mostDownloadedFile && (
              <div className="rounded-xl border border-border p-5 bg-card/50">
                <div className="text-sm text-muted-foreground mb-1">Most Downloaded</div>
                <div className="font-medium truncate text-lg">{stats.mostDownloadedFile.filename}</div>
                <div className="text-sm text-muted-foreground">Downloads: {stats.mostDownloadedFile.downloadCount}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
