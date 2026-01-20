import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layouts/UserLayout';

export const Settings = () => {
  const { theme, setTheme, session } = useStore();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast({
      title: `Theme changed to ${newTheme}`,
      description: 'Your preference has been saved.',
    });
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile Settings',
          description: 'Update your account details',
          action: () => setShowAccountModal(true),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage notification settings',
          toggle: {
            checked: notificationsEnabled,
            onChange: (checked: boolean) => {
              setNotificationsEnabled(checked);
              toast({ title: checked ? 'Notifications enabled' : 'Notifications disabled' });
            },
          },
        },
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Toggle dark/light theme',
          toggle: {
            checked: theme === 'dark',
            onChange: handleThemeChange,
          },
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'FAQs and support',
          link: true,
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          description: 'Read our privacy policy',
          link: true,
        },
        {
          icon: FileText,
          label: 'Terms of Service',
          description: 'Read our terms',
          link: true,
        },
      ],
    },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold">Settings</h1>
        </div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary-foreground">
                    {session?.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{session?.username}</p>
                  <p className="text-sm text-muted-foreground">Demo User Account</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
          >
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={item.action}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        item.action || item.link ? 'cursor-pointer hover:bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {item.toggle ? (
                        <Switch
                          checked={item.toggle.checked}
                          onCheckedChange={item.toggle.onChange}
                        />
                      ) : item.link ? (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      ) : item.action ? (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Version Info */}
        <p className="text-center text-xs text-muted-foreground">
          Pirate Parlays MVP Demo v1.0
        </p>
      </div>

      {/* Account Settings Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Update your account details (Demo only)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={session?.username} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="user@demo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input placeholder="••••••••" type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input placeholder="••••••••" type="password" />
            </div>
            <Button
              onClick={() => {
                toast({ title: 'Demo Only', description: 'Profile updates are not saved in demo mode.' });
                setShowAccountModal(false);
              }}
              className="w-full gradient-primary text-primary-foreground"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default Settings;
