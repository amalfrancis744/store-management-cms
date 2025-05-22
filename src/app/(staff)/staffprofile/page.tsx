'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchUserProfile,
  updateUserProfile,
  updateUserProfileImage,
  clearProfileErrors,
} from '@/store/slices/customer/userProfileSlice';
import { User, Pencil, Save, Loader2, Camera, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

interface Address {
  id: string;
  address: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  profileImageUrl: string | null;
  Address: Address[];
  updatedAt: string;
}

export default function StaffProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading, error } = useSelector(
    (state: RootState) => state.userProfile
  );

  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const userId = user?.id || '';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    address: '',
    street: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
  });

  // Form state for editing address
  const [editAddressData, setEditAddressData] = useState<Address>({
    id: '',
    address: '',
    street: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
  });

  // Initialize form data when profile is loaded
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile]);

  // Handle profile form submission
  const handleProfileSubmit = async () => {
    dispatch(clearProfileErrors());
    const resultAction = await dispatch(
      updateUserProfile({ userId, profileData: formData })
    );
    if (updateUserProfile.fulfilled.match(resultAction)) {
      dispatch(fetchUserProfile());
      setIsEditing(false);
    }
  };

  // Handle input changes for profile form
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle input changes for edit address form
  const handleEditAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditAddressData({ ...editAddressData, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imagePreview) return;

    setIsUploadingImage(true);
    dispatch(clearProfileErrors());

    try {
      const resultAction = await dispatch(updateUserProfileImage(imagePreview));

      // Check if the action was fulfilled (successful)
      if (updateUserProfileImage.fulfilled.match(resultAction)) {
        // Fetch updated profile with new image
        dispatch(fetchUserProfile());
        setImagePreview(null);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Cancel image upload
  const cancelImageUpload = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate completion percentage for profile
  const calculateProfileCompletion = () => {
    if (!profile) return 0;

    const total = 4;
    let completed = 0;

    if (profile.firstName) completed++;
    if (profile.lastName) completed++;
    if (profile.email) completed++;
    if (profile.phone) completed++;
    if (profile.profileImageUrl) completed += 0.5;
    if (profile.Address && profile.Address.length > 0) completed += 0.5;

    return Math.min(Math.round((completed / total) * 100), 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Navigation items
  const navItems = [{ id: 'profile', label: 'Profile', icon: User }];

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-background border-r h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold">My Account</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your profile
          </p>
        </div>

        <div className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === item.id
                      ? 'bg-slate-500 text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex flex-1 flex-col items-center gap-1 p-3 ${
                  activeSection === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={profile.profileImageUrl || ''}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
              <AvatarFallback className="bg-primary/10">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold">My Account</h1>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Profile Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle>Profile Summary</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <div className="relative group mb-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={imagePreview || profile.profileImageUrl || ''}
                          alt={`${profile.firstName} ${profile.lastName}`}
                        />
                        <AvatarFallback className="text-4xl bg-primary/10">
                          {profile.firstName.charAt(0)}
                          {profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {!imagePreview && (
                        <div
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </div>

                    {imagePreview && (
                      <div className="flex gap-2 mb-4">
                        <Button
                          size="sm"
                          onClick={handleImageUpload}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelImageUpload}
                          disabled={isUploadingImage}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    <h3 className="text-xl font-bold mt-2">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm mt-1">{profile.phone}</p>

                    <div className="w-full mt-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completion</span>
                        <span>{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2" />
                    </div>

                    <div className="w-full mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground">
                        Member since
                      </p>
                      <p className="font-medium">
                        {formatDate(profile.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Details Card */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleProfileSubmit}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reset form data to original profile data
                              if (profile) {
                                setFormData({
                                  firstName: profile.firstName,
                                  lastName: profile.lastName,
                                  email: profile.email,
                                  phone: profile.phone,
                                });
                              }
                              setIsEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          disabled={isLoading}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleProfileChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              First Name
                            </p>
                            <p className="font-medium">{profile.firstName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Last Name
                            </p>
                            <p className="font-medium">{profile.lastName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium">{profile.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium">{profile.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
