import { Button } from '../components/ui/Button';
// import { supabase } from '../lib/supabase';
import { ArrowLeft, CreditCard, Key, Loader2, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
    id: string;
    cardType: string;
    lastFourDigits: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
    });
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            cardType: 'Visa',
            lastFourDigits: '4242',
            expiryMonth: 12,
            expiryYear: 24,
            isDefault: true,
        },
        {
            id: '2',
            cardType: 'Mastercard',
            lastFourDigits: '8888',
            expiryMonth: 6,
            expiryYear: 25,
            isDefault: false,
        },
    ]);
    const navigate = useNavigate()
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsEditingProfile(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsAddingPaymentMethod(false);
            toast.success('Payment method added successfully');
        } catch (error) {
            console.error('Error adding payment method:', error);
            toast.error('Failed to add payment method');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePaymentMethod = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
            toast.success('Payment method removed successfully');
        } catch (error) {
            console.error('Error removing payment method:', error);
            toast.error('Failed to remove payment method');
        }
    };

    const handleSetDefaultPaymentMethod = async (id: string) => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPaymentMethods(methods =>
                methods.map(method => ({
                    ...method,
                    isDefault: method.id === id,
                }))
            );
            toast.success('Default payment method updated');
        } catch (error) {
            console.error('Error setting default payment method:', error);
            toast.error('Failed to update default payment method');
        }
    };

    return (
        <><Header />
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6 ">
                    <Button
                        variant="ghost"
                        className="text-xl"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <div className="w-[100px]"></div>
                </div>
                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                                >
                                    {isEditingProfile ? 'Cancel' : 'Edit'}
                                </Button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isEditingProfile ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Name</div>
                                            <div className="font-medium">{profile.firstName} {profile.lastName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Email</div>
                                            <div className="font-medium">{profile.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Phone</div>
                                            <div className="font-medium">{profile.phone}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Methods Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddingPaymentMethod(!isAddingPaymentMethod)}
                                >
                                    {isAddingPaymentMethod ? 'Cancel' : 'Add New'}
                                </Button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isAddingPaymentMethod ? (
                                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="4111 1111 1111 1111"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Add Payment Method'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {method.cardType} •••• {method.lastFourDigits}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Expires {method.expiryMonth}/{method.expiryYear}
                                                    </div>
                                                </div>
                                                {method.isDefault && (
                                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!method.isDefault && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                                    >
                                                        Set Default
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:border-red-600"
                                                    onClick={() => handleRemovePaymentMethod(method.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-gray-400" />
                                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <Button variant="outline">Change Password</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}