'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsUser } from '../SettingsClient';
import { cn } from '@/lib/utils';

interface ProfileTabProps {
  currentUser: SettingsUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<SettingsUser>>;
}

export function ProfileTab({ currentUser, setCurrentUser }: ProfileTabProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    displayName: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
    bio: currentUser.bio || '',
    githubUrl: currentUser.githubUrl || '',
    linkedinUrl: currentUser.linkedinUrl || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);

    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileFeedback({ type: 'error', message: data.error || 'Failed to update profile' });
      } else {
        setProfileFeedback({ type: 'success', message: 'Profile details saved successfully!' });
        setCurrentUser((prev) => ({
          ...prev,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          displayName: profileForm.displayName,
          bio: profileForm.bio,
          githubUrl: profileForm.githubUrl,
          linkedinUrl: profileForm.linkedinUrl,
        }));
        router.refresh();
      }
    } catch {
      setProfileFeedback({ type: 'error', message: 'A network error occurred. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarFeedback({ type: 'error', message: 'Only JPG, PNG, and WebP images are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarFeedback({ type: 'error', message: 'File size must be under 5MB.' });
      return;
    }

    setAvatarUploading(true);
    setAvatarFeedback(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setAvatarFeedback({ type: 'error', message: data.error || 'Avatar upload failed.' });
      } else {
        setAvatarFeedback({ type: 'success', message: 'Profile photo updated successfully!' });
        setCurrentUser((prev) => ({
          ...prev,
          avatarUrl: data.avatarUrl,
          avatarPublicId: data.publicId,
        }));
        router.refresh();
      }
    } catch {
      setAvatarFeedback({ type: 'error', message: 'Network error uploading avatar.' });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser.avatarUrl) return;
    setAvatarUploading(true);
    setAvatarFeedback(null);

    try {
      const res = await fetch('/api/upload/avatar', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setAvatarFeedback({ type: 'error', message: data.error || 'Failed to remove avatar.' });
      } else {
        setAvatarFeedback({ type: 'success', message: 'Avatar removed.' });
        setCurrentUser((prev) => ({ ...prev, avatarUrl: null, avatarPublicId: null }));
        router.refresh();
      }
    } catch {
      setAvatarFeedback({ type: 'error', message: 'Network error removing avatar.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Profile Avatar</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Upload your profile photo. Supported formats: JPG, PNG, WebP up to 5MB.
          </p>
        </div>

        {avatarFeedback && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
              avatarFeedback.type === 'success'
                ? 'bg-gdg-green/10 text-gdg-green border border-gdg-green/20'
                : 'bg-gdg-red/10 text-gdg-red border border-gdg-red/20'
            )}
          >
            {avatarFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{avatarFeedback.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-gdg-cream shadow-sm">
              <AvatarImage src={currentUser.avatarUrl || ''} />
              <AvatarFallback className="bg-gdg-blue text-white font-black text-2xl">
                {currentUser.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarFileChange}
              disabled={avatarUploading}
            />

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-gdg-cream hover:bg-gdg-black/85 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-gdg-yellow" />
                <span>{currentUser.avatarUrl ? 'Replace Avatar' : 'Upload Avatar'}</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-gdg-border text-gdg-red hover:bg-gdg-red/5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-gdg-gray font-medium">
              Recommended: Square image, 400x400 pixels or larger.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl border border-gdg-border bg-white p-6 sm:p-8 shadow-2xs space-y-6"
      >
        <div className="border-b border-gdg-border pb-4">
          <h3 className="text-lg font-black text-gdg-black">Personal Details</h3>
          <p className="text-xs text-gdg-gray font-medium">
            Update your public profile, display name, and biographical information.
          </p>
        </div>

        {profileFeedback && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
              profileFeedback.type === 'success'
                ? 'bg-gdg-green/10 text-gdg-green border border-gdg-green/20'
                : 'bg-gdg-red/10 text-gdg-red border border-gdg-red/20'
            )}
          >
            {profileFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{profileFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gdg-black">First Name *</label>
            <input
              type="text"
              required
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gdg-black">Last Name *</label>
            <input
              type="text"
              required
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gdg-black">Display Name</label>
          <input
            type="text"
            value={profileForm.displayName}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))
            }
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
            placeholder="How other students and mentors see your name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gdg-black">Bio</label>
          <textarea
            rows={3}
            value={profileForm.bio}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
            }
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
            placeholder="Tell your cohort about your background, interests, and what you're building..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gdg-black">GitHub Profile URL</label>
            <input
              type="url"
              value={profileForm.githubUrl}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, githubUrl: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gdg-black">LinkedIn Profile URL</label>
            <input
              type="url"
              value={profileForm.linkedinUrl}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))
              }
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gdg-border bg-white text-gdg-black focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue transition-all"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gdg-border">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gdg-black text-white hover:bg-gdg-dark-hover transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {profileSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
