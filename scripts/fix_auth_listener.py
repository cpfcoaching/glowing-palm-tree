import os

app_dir = '/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1'
app_path = os.path.join(app_dir, 'src/App.tsx')

with open(app_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '// Auth Status listener' in line:
        start_idx = i
    if start_idx != -1 and '}, [currentScreen]);' in line:
        end_idx = i
        break

print(f"Found block from line {start_idx} to {end_idx}")
assert start_idx != -1 and end_idx != -1, "Auth block not found"

new_lines = [
    "  // Auth Status listener\n",
    "  useEffect(() => {\n",
    "    const unsubscribe = auth.onAuthStateChanged((currentUser) => {\n",
    "      setAuthLoading(false);\n",
    "      if (currentUser) {\n",
    "        setUser(currentUser);\n",
    "        addToast(`Authenticated as ${currentUser.displayName || currentUser.email}`, 'success');\n",
    "        setCurrentScreen(prev => prev === Screen.Landing ? Screen.Overview : prev);\n",
    "      } else {\n",
    "        setUser(prev => {\n",
    "          if (prev?.uid === 'demo_user') return prev;\n",
    "          setTenant(null);\n",
    "          setChannels([]);\n",
    "          setVideos([]);\n",
    "          setAnalytics([]);\n",
    "          setLatestJob(null);\n",
    "          setSelectedChannelId('');\n",
    "          setCurrentScreen(Screen.Landing);\n",
    "          return null;\n",
    "        });\n",
    "      }\n",
    "    });\n",
    "\n",
    "    return () => unsubscribe();\n",
    "  }, []);\n"
]

lines = lines[:start_idx] + new_lines + lines[end_idx+1:]

with open(app_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Auth listener updated successfully!")
