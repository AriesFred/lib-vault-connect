import * as React from "react";
import { Settings, Palette, Bell, Monitor, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";

interface SettingsPanelProps {
  className?: string;
}

const SettingsPanel = React.forwardRef<HTMLDivElement, SettingsPanelProps>(
  ({ className, ...props }, ref) => {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = React.useState({
      decryptionSuccess: true,
      batchOperations: true,
      errors: true,
      achievements: false,
    });

    const [preferences, setPreferences] = React.useState({
      autoRefresh: true,
      showAnimations: true,
      compactMode: false,
      dataRetention: "30days",
    });

    const handleNotificationChange = (key: string, value: boolean) => {
      setNotifications(prev => ({ ...prev, [key]: value }));
    };

    const handlePreferenceChange = (key: string, value: boolean | string) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div ref={ref} className={className} {...props}>
        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2 h-auto p-3"
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2 h-auto p-3"
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2 h-auto p-3"
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">System</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Interface Preferences */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Interface Preferences</Label>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="animations" className="text-sm font-medium">
                        Show Animations
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={preferences.showAnimations}
                    onCheckedChange={(checked) => handlePreferenceChange("showAnimations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="compact" className="text-sm font-medium">
                        Compact Mode
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reduce spacing and padding for more content
                    </p>
                  </div>
                  <Switch
                    id="compact"
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => handlePreferenceChange("compactMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="autorefresh" className="text-sm font-medium">
                        Auto Refresh
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically refresh data every 30 seconds
                    </p>
                  </div>
                  <Switch
                    id="autorefresh"
                    checked={preferences.autoRefresh}
                    onCheckedChange={(checked) => handlePreferenceChange("autoRefresh", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                Notifications
              </CardTitle>
              <CardDescription>
                Configure when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="decryption-success" className="text-sm font-medium">
                    Decryption Success
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when category decryption completes
                  </p>
                </div>
                <Switch
                  id="decryption-success"
                  checked={notifications.decryptionSuccess}
                  onCheckedChange={(checked) => handleNotificationChange("decryptionSuccess", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="batch-operations" className="text-sm font-medium">
                    Batch Operations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when batch operations complete
                  </p>
                </div>
                <Switch
                  id="batch-operations"
                  checked={notifications.batchOperations}
                  onCheckedChange={(checked) => handleNotificationChange("batchOperations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="errors" className="text-sm font-medium">
                    Error Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when operations fail
                  </p>
                </div>
                <Switch
                  id="errors"
                  checked={notifications.errors}
                  onCheckedChange={(checked) => handleNotificationChange("errors", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="achievements" className="text-sm font-medium">
                    Achievement Unlocks
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when you unlock new achievements
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
                </div>
                <Switch
                  id="achievements"
                  checked={notifications.achievements}
                  onCheckedChange={(checked) => handleNotificationChange("achievements", checked)}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Eye className="w-5 h-5 text-success" />
                </div>
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your data retention and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Data Retention</Label>
                <Select
                  value={preferences.dataRetention}
                  onValueChange={(value) => handlePreferenceChange("dataRetention", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How long to keep your decrypted data in local storage
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Clear Local Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  Remove all locally stored decrypted data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
);
SettingsPanel.displayName = "SettingsPanel";

export { SettingsPanel };
