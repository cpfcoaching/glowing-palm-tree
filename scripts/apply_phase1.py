import os

app_dir = '/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1'

# 1. Update Overview.tsx
overview_path = os.path.join(app_dir, 'src/components/Overview.tsx')
with open(overview_path, 'r', encoding='utf-8') as f:
    overview_lines = f.readlines()

for i, line in enumerate(overview_lines):
    if 'onNavigate: (screen: Screen) => void;' in line:
        overview_lines[i] = "  onNavigate: (screen: Screen, filter?: 'all' | 'missing' | 'low_score') => void;\n"
        print("Updated onNavigate prop in Overview.tsx")
        break

for i, line in enumerate(overview_lines):
    if 'id="stat-card-seo"' in line:
        overview_lines[i] = '''        <div 
          onClick={() => onNavigate(Screen.Videos, 'low_score')}
          className="p-6 bg-brand-surface border border-brand-border hover:border-brand-primary/50 hover:bg-brand-surface-2/30 rounded-xl space-y-4 cursor-pointer transition-all group" 
          id="stat-card-seo"
          title="Click to filter videos with SEO Score < 50"
        >\n'''
        print("Updated stat-card-seo opening tag")
        break

for i, line in enumerate(overview_lines):
    if 'id="lbl-stat-seo"' in line and '<span className="text-[10px]' in line:
        overview_lines[i] = '''              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-brand-text-muted uppercase block" id="lbl-stat-seo">
                  Avg SEO Score
                </span>
                <span className="text-[9px] font-mono text-[#EAB308] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Filter &lt; 50 <ChevronRight className="w-2.5 h-2.5 inline" />
                </span>
              </div>\n'''
        print("Updated lbl-stat-seo in Overview.tsx")
        break

for i, line in enumerate(overview_lines):
    if 'id="stat-card-coverage"' in line:
        overview_lines[i] = '''        <div 
          onClick={() => onNavigate(Screen.Videos, 'missing')}
          className="p-6 bg-brand-surface border border-brand-border hover:border-brand-primary/50 hover:bg-brand-surface-2/30 rounded-xl space-y-4 cursor-pointer transition-all group" 
          id="stat-card-coverage"
          title="Click to filter videos missing CTA links"
        >\n'''
        print("Updated stat-card-coverage opening tag")
        break

for i, line in enumerate(overview_lines):
    if 'id="lbl-stat-coverage"' in line and '<span className="text-[10px]' in line:
        overview_lines[i] = '''              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-brand-text-muted uppercase block" id="lbl-stat-coverage">
                  CTA Coverage
                </span>
                <span className="text-[9px] font-mono text-brand-primary-bright font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Missing CTAs <ChevronRight className="w-2.5 h-2.5 inline" />
                </span>
              </div>\n'''
        print("Updated lbl-stat-coverage in Overview.tsx")
        break

for i, line in enumerate(overview_lines):
    if 'id="stat-card-videos"' in line and '<div className="p-6' in line:
        overview_lines[i] = '''        <div 
          onClick={() => onNavigate(Screen.Videos, 'all')}
          className="p-6 bg-brand-surface border border-brand-border hover:border-brand-primary/50 hover:bg-brand-surface-2/30 rounded-xl flex flex-col justify-between h-full cursor-pointer transition-all group" 
          id="stat-card-videos"
          title="Click to view all channel videos in catalog"
        >\n'''
        print("Updated stat-card-videos opening tag")
        break

for i, line in enumerate(overview_lines):
    if 'id="lbl-stat-videos"' in line and '<span className="text-[10px]' in line:
        overview_lines[i] = '''              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-brand-text-muted uppercase block" id="lbl-stat-videos">
                  Total Videos
                </span>
                <span className="text-[9px] font-mono text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  View All <ChevronRight className="w-2.5 h-2.5 inline" />
                </span>
              </div>\n'''
        print("Updated lbl-stat-videos in Overview.tsx")
        break

with open(overview_path, 'w', encoding='utf-8') as f:
    f.writelines(overview_lines)

print("Overview.tsx write complete!")

# 2. Update Videos.tsx
videos_path = os.path.join(app_dir, 'src/components/Videos.tsx')
with open(videos_path, 'r', encoding='utf-8') as f:
    videos_code = f.read()

# Update VideosProps
old_props = """interface VideosProps {
  videos: Video[];
  channels?: Channel[];
  selectedChannelId: string;
  onSelectChannel?: (channelId: string) => void;
  onAddChannel?: () => void;
  onVideoUpdated?: (updatedVideo: Video) => void;
  onAddToast: (text: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  isLoading: boolean;
}"""

new_props = """interface VideosProps {
  videos: Video[];
  channels?: Channel[];
  selectedChannelId: string;
  onSelectChannel?: (channelId: string) => void;
  onAddChannel?: () => void;
  onVideoUpdated?: (updatedVideo: Video) => void;
  onAddToast: (text: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  isLoading: boolean;
  initialFilter?: 'all' | 'missing' | 'low_score';
}"""

assert old_props in videos_code, "VideosProps definition not matched"
videos_code = videos_code.replace(old_props, new_props)

# Update Videos function signature
old_sig = """export default function Videos({ 
  videos, 
  channels,
  selectedChannelId, 
  onSelectChannel,
  onAddChannel,
  onVideoUpdated,
  onAddToast, 
  isLoading 
}: VideosProps) {"""

new_sig = """export default function Videos({ 
  videos, 
  channels,
  selectedChannelId, 
  onSelectChannel,
  onAddChannel,
  onVideoUpdated,
  onAddToast, 
  isLoading,
  initialFilter = 'all'
}: VideosProps) {"""

assert old_sig in videos_code, "Videos function signature not matched"
videos_code = videos_code.replace(old_sig, new_sig)

# Update filterType initial value and effect
old_filter_state = """  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'missing' | 'low_score'>('all');"""

new_filter_state = """  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'missing' | 'low_score'>(initialFilter);

  useEffect(() => {
    if (initialFilter) {
      setFilterType(initialFilter);
    }
  }, [initialFilter]);"""

assert old_filter_state in videos_code, "filterType state not matched"
videos_code = videos_code.replace(old_filter_state, new_filter_state)

# Update channelTotalCatalogVideos & isBackCatalogPending calculation
old_calc = """  const channelTotalCatalogVideos = activeChannel?.totalVideosCount || 1149;
  const isBackCatalogPending = localVideos.length < channelTotalCatalogVideos;"""

new_calc = """  const channelTotalCatalogVideos = activeChannel?.totalVideosCount || 1149;
  const effectiveCatalogTotal = Math.max(localVideos.length, channelTotalCatalogVideos || 0);
  const remainingBackCatalog = Math.max(0, channelTotalCatalogVideos - localVideos.length);
  const isBackCatalogPending = remainingBackCatalog > 0;"""

assert old_calc in videos_code, "channelTotalCatalogVideos calculation not matched"
videos_code = videos_code.replace(old_calc, new_calc)

# Update banner display text
old_banner_str = "Channel Ingestion Status: {localVideos.length.toLocaleString()} / {channelTotalCatalogVideos.toLocaleString()} Videos Ingested"
new_banner_str = "Channel Ingestion Status: {localVideos.length.toLocaleString()} / {effectiveCatalogTotal.toLocaleString()} Videos Ingested"
assert old_banner_str in videos_code, "Banner status string not matched"
videos_code = videos_code.replace(old_banner_str, new_banner_str)

old_percent_str = "{Math.min(100, Math.round((localVideos.length / (channelTotalCatalogVideos || 1)) * 100))}% Indexed"
new_percent_str = "{effectiveCatalogTotal > 0 ? Math.min(100, Math.round((localVideos.length / effectiveCatalogTotal) * 100)) : 100}% Indexed"
assert old_percent_str in videos_code, "Percent indexed string not matched"
videos_code = videos_code.replace(old_percent_str, new_percent_str)

old_prog_width = "style={{ width: `${Math.min(100, Math.max(3, (localVideos.length / (channelTotalCatalogVideos || 1)) * 100))}%` }}"
new_prog_width = "style={{ width: `${effectiveCatalogTotal > 0 ? Math.min(100, Math.max(3, (localVideos.length / effectiveCatalogTotal) * 100)) : 100}%` }}"
assert old_prog_width in videos_code, "Progress width not matched"
videos_code = videos_code.replace(old_prog_width, new_prog_width)

old_desc_pending = """            <p className=\"text-[11px] text-brand-text-muted\">
              {isBackCatalogPending 
                ? `Channel has ${(channelTotalCatalogVideos - localVideos.length).toLocaleString()} additional back-catalog videos available on YouTube. Ingest in 100-video increments or run automated continuous sync.`
                : `All ${localVideos.length.toLocaleString()} videos in the YouTube channel back-catalog have been synchronized into your SEO workspace.`}
            </p>"""

new_desc_pending = """            <p className=\"text-[11px] text-brand-text-muted\">
              {isBackCatalogPending 
                ? `Channel has ${remainingBackCatalog.toLocaleString()} additional back-catalog videos available on YouTube. Ingest in 100-video increments or run automated continuous sync.`
                : `All ${localVideos.length.toLocaleString()} videos in the YouTube channel back-catalog have been synchronized into your SEO workspace.`}
            </p>"""

assert old_desc_pending in videos_code, "Pending description string not matched"
videos_code = videos_code.replace(old_desc_pending, new_desc_pending)

old_btn_title = "title={`Ingest all ${(channelTotalCatalogVideos - localVideos.length).toLocaleString()} remaining videos`}"
new_btn_title = "title={`Ingest all ${remainingBackCatalog.toLocaleString()} remaining videos`}"
assert old_btn_title in videos_code, "Button title not matched"
videos_code = videos_code.replace(old_btn_title, new_btn_title)

old_btn_label = "<span>Ingest Full Channel (${channelTotalCatalogVideos.toLocaleString()})</span>"
new_btn_label = "<span>Ingest Full Channel ({effectiveCatalogTotal.toLocaleString()})</span>"
assert old_btn_label in videos_code, "Button label not matched"
videos_code = videos_code.replace(old_btn_label, new_btn_label)

with open(videos_path, 'w', encoding='utf-8') as f:
    f.write(videos_code)

print("Videos.tsx write complete!")
