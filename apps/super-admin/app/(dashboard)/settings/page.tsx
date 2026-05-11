'use client'
// Force rebuild to fix Badge reference error
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Save,
  CloudUpload,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-full pb-10">
      <Header 
        title="Settings" 
        description="Configure your platform and personal preferences"
      >
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </Header>

      <div className="flex-1 space-y-6 p-6 max-w-5xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-12">
            <TabsTrigger value="general" className="gap-2 px-6 h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 px-6 h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-6 h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-6 h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Main settings for the BeaconU platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Platform Name</Label>
                    <Input id="site-name" defaultValue="BeaconU Super Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email Address</Label>
                    <Input id="support-email" defaultValue="support@beaconu.com" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Platform Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold">
                      B
                    </div>
                    <div className="space-y-1.5">
                      <Button variant="outline" size="sm" className="gap-2">
                        <CloudUpload className="h-4 w-4" />
                        Change Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or SVG. Max size 2MB.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm border-l-4 border-l-amber-500 bg-amber-50/30">
              <CardHeader>
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                </div>
                <CardDescription>Put the platform in maintenance mode for updates</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground max-w-md">
                  While in maintenance mode, all users (except admins) will see a maintenance page.
                </p>
                <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                  Enable Maintenance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details displayed on the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-4 border-white shadow-md relative group">
                    <User className="h-10 w-10" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <CloudUpload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground mb-3">Update your avatar displayed in the dashboard</p>
                    <div className="flex gap-2">
                      <Button size="sm">Upload New</Button>
                      <Button size="sm" variant="ghost" className="text-destructive">Remove</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" defaultValue="Super Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="superadmin@beaconu.com" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Assigned Role</Label>
                    <Input id="role" defaultValue="Super Administrator" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="mt-2">Update Password</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                </div>
                <CardDescription>Add an additional layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground max-w-md">
                  Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                </p>
                <Badge variant="success" className="h-7 px-3">Enabled</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
             <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about platform activities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily digests and critical alerts via email.' },
                  { title: 'Push Notifications', desc: 'Real-time alerts in your browser when things happen.' },
                  { title: 'SMS Alerts', desc: 'Critical security alerts sent directly to your phone.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
