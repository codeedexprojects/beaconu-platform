'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Database,
  Mail,
  Lock,
  ChevronRight,
  Save
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'system', label: 'System Configuration', icon: Database },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" description="Configure platform-wide settings and your personal preferences" />
      
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-1">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {activeSection === 'profile' && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Platform Administrator Profile</CardTitle>
                  <CardDescription>Update your personal information and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Full Name</Label>
                      <Input id="firstName" defaultValue="Super Admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue="admin@beaconu.com" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Administrative Role</Label>
                    <Input id="bio" defaultValue="Platform Super Administrator" disabled />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-end">
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>Control how and when you receive platform alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Student Registration</Label>
                      <p className="text-xs text-muted-foreground">Receive alerts when a new student joins</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Agency Approval Requests</Label>
                      <p className="text-xs text-muted-foreground">Get notified about new associate admin signups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Health Alerts</Label>
                      <p className="text-xs text-muted-foreground">Critical infrastructure and API monitoring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                  <CardDescription>Manage your authentication and account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between h-11 px-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Change Password</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between h-11 px-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Two-Factor Authentication</span>
                    </div>
                    <Badge variant="warning">Off</Badge>
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {(activeSection === 'appearance' || activeSection === 'system') && (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
                <Settings className="h-10 w-10 text-muted-foreground mb-4 animate-spin-slow" />
                <h3 className="text-lg font-semibold">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">This settings module is currently under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
