'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchUserProfile,
  updateUserProfile,
  addUserAddress,
  deleteUserAddress,
  updateUserProfileImage,
  updateUserAddress,
  clearProfileErrors,
} from '@/store/slices/customer/userProfileSlice';
import {
  Trash2,
  PlusCircle,
  User,
  MapPin,
  Pencil,
  Save,
  Loader2,
  Camera,
  Upload,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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

export default function UserProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading, error } = useSelector(
    (state: RootState) => state.userProfile
  );

  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const userId = user?.id || '';

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
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

  // Handle new address form submission
  const handleAddressSubmit = async () => {
    dispatch(clearProfileErrors());
    await dispatch(addUserAddress(newAddress));
    setNewAddress({
      address: '',
      street: '',
      city: '',
      region: '',
      country: '',
      postalCode: '',
    });
    setIsAddingAddress(false);
  };

  // Handle edit address form submission
  const handleEditAddressSubmit = async () => {
    if (!editingAddressId) return;

    dispatch(clearProfileErrors());
    await dispatch(
      updateUserAddress({
        addressId: editingAddressId,
        addressData: editAddressData,
      })
    );
    await dispatch(fetchUserProfile());
    setEditingAddressId(null);
  };

  // Start editing an address
  const startEditingAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setEditAddressData({ ...address });
  };

  // Cancel editing address
  const cancelEditingAddress = () => {
    setEditingAddressId(null);
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId: string) => {
    dispatch(clearProfileErrors());
    await dispatch(deleteUserAddress(addressId));
  };

  // Handle input changes for profile form
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle input changes for address form
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
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
      await dispatch(updateUserProfileImage(imagePreview));
      setImagePreview(null);
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

  const uniqueAddresses = profile?.Address || [];

  console.log('Unique Addresses:====>', uniqueAddresses);

  // Navigation items
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

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
                      ? 'bg-primary text-primary-foreground'
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
                      <Button
                        variant={isEditing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isLoading}
                      >
                        {isEditing ? (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        ) : (
                          <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleProfileSubmit();
                        }}
                      >
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
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isLoading}
                        >
                          {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </form>
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

          {/* Addresses Section */}
          {activeSection === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  My Addresses
                </h2>
                <Button
                  onClick={() => {
                    setIsAddingAddress(true);
                    setEditingAddressId(null);
                  }}
                  disabled={isLoading || isAddingAddress || !!editingAddressId}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              </div>

              {isAddingAddress ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Address</CardTitle>
                    <CardDescription>
                      Enter your address details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddressSubmit();
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={newAddress.address}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="street">Street</Label>
                          <Input
                            id="street"
                            name="street"
                            value={newAddress.street}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region/State</Label>
                          <Input
                            id="region"
                            name="region"
                            value={newAddress.region}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleAddressChange}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingAddress(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : editingAddressId ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Edit Address</CardTitle>
                        <CardDescription>
                          Update your address details
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEditingAddress}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditAddressSubmit();
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="edit-address">Address</Label>
                          <Input
                            id="edit-address"
                            name="address"
                            value={editAddressData.address}
                            onChange={handleEditAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-street">Street</Label>
                          <Input
                            id="edit-street"
                            name="street"
                            value={editAddressData.street}
                            onChange={handleEditAddressChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-city">City</Label>
                          <Input
                            id="edit-city"
                            name="city"
                            value={editAddressData.city}
                            onChange={handleEditAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-region">Region/State</Label>
                          <Input
                            id="edit-region"
                            name="region"
                            value={editAddressData.region}
                            onChange={handleEditAddressChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-country">Country</Label>
                          <Input
                            id="edit-country"
                            name="country"
                            value={editAddressData.country}
                            onChange={handleEditAddressChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-postalCode">Postal Code</Label>
                          <Input
                            id="edit-postalCode"
                            name="postalCode"
                            value={editAddressData.postalCode}
                            onChange={handleEditAddressChange}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditingAddress}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniqueAddresses.length > 0 ? (
                    uniqueAddresses.map((address, index) => (
                      <Card key={address.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              Address {index + 1}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-medium">{address.address}</p>
                            {address.street && (
                              <p className="text-sm text-muted-foreground">
                                {address.street}
                              </p>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {address.city && <span>{address.city}, </span>}
                              {address.region && (
                                <span>{address.region}, </span>
                              )}
                              {address.country && (
                                <span>{address.country} </span>
                              )}
                              {address.postalCode && (
                                <span>{address.postalCode}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => startEditingAddress(address)}
                            disabled={isLoading || !!editingAddressId}
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg">
                      <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">
                        No addresses found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        You haven't added any addresses yet. Add an address to
                        make checkout faster.
                      </p>
                      <Button
                        onClick={() => setIsAddingAddress(true)}
                        disabled={isLoading}
                      >
                        Add Your First Address
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
