"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, ExternalLink, Globe } from "lucide-react";

export default function SettingsPage() {
  const [builderCode, setBuilderCode] = useState("PREDICTBOARD");
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const bc = localStorage.getItem("builder-code");
    if (bc) setBuilderCode(bc);
  }, []);

  function handleSave() {
    localStorage.setItem("builder-code", builderCode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure preferences and integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Platform Integrations
          </CardTitle>
          <CardDescription>
            Sigmar aggregates data from 4 prediction market platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Polymarket</span>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
              Public API
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">Kalshi</span>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Public API
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">Manifold Markets</span>
            </div>
            <a
              href="https://manifold.markets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Public API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-sm font-medium">Opinion</span>
            </div>
            <a
              href="https://app.opinion.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              Public API <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Builder Code</CardTitle>
          <CardDescription>
            Your Polymarket builder code for referral tracking. Appended to trade links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="builder-code">Builder Code</Label>
            <Input
              id="builder-code"
              value={builderCode}
              onChange={(e) => setBuilderCode(e.target.value)}
              placeholder="PREDICTBOARD"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Toggle dark/light theme
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
        {saved && (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
            Saved!
          </Badge>
        )}
      </div>
    </div>
  );
}
