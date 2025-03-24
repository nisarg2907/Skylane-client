import { Button } from '../components/ui/Button';
import { ArrowLeft, CreditCard, Key, Loader2, Mail, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/AuthStore';
import api from '../lib/utils';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
    id: string;
    cardType: string;
    lastFourDigits: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    cardHolderName: string;
}

export function ProfilePage() {
    const { user, getAccessToken, updateUserInStore } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [newCardInfo, setNewCardInfo] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardType: 'Visa', // Default card type
    });

    const navigate = useNavigate();

    // Fetch payment methods on component mount
    useEffect(() => {
        fetchPaymentMethods();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Function to fetch payment methods from API
    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            const token = await getAccessToken();

            if (!token) {
                toast.error('Authentication error. Please login again.');
                return;
            }

            const response = await api.get('/users/payment-methods', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentMethods(response.data);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to update user profile
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.patch(
                '/users/profile',
                {
                    firstName: profile.firstName,
                    lastName: profile.lastName
                }
            );

            // Update user in store
            if (response.data) {
                await updateUserInStore({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    id: user?.id ?? '',
                    email: user?.email ?? ''
                });

                toast.success('Profile updated successfully');
                setIsEditingProfile(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to add payment method
    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = await getAccessToken();

            if (!token) {
                toast.error('Authentication error. Please login again.');
                return;
            }

            // Call API to create payment method
            await api.post(
                '/users/payment-methods',
                {
                    cardNumber: newCardInfo.cardNumber,
                    cardHolderName: newCardInfo.cardHolderName,
                    expiryMonth: newCardInfo.expiryMonth,
                    expiryYear: newCardInfo.expiryYear,
                    cvv: newCardInfo.cvv,
                    cardType: newCardInfo.cardType,
                    isDefault: paymentMethods.length === 0
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Payment method added successfully');

            // Reset form and fetch updated payment methods
            setNewCardInfo({
                cardNumber: '',
                cardHolderName: '',
                expiryMonth: '',
                expiryYear: '',
                cvv: '',
                cardType: 'Visa',
            });
            setIsAddingPaymentMethod(false);
            await fetchPaymentMethods();
        } catch (error) {
            console.error('Error adding payment method:', error);
            toast.error('Failed to add payment method');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to remove payment method
    const handleRemovePaymentMethod = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        try {
            const token = await getAccessToken();

            if (!token) {
                toast.error('Authentication error. Please login again.');
                return;
            }

            await api.delete(`/users/payment-methods/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Payment method removed successfully');
            await fetchPaymentMethods();
        } catch (error) {
            console.error('Error removing payment method:', error);
            toast.error('Failed to remove payment method');
        }
    };

    // Function to set default payment method
    const handleSetDefaultPaymentMethod = async (id: string) => {
        try {
            const token = await getAccessToken();

            if (!token) {
                toast.error('Authentication error. Please login again.');
                return;
            }

            await api.post(`/users/payment-methods/${id}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Default payment method updated');
            await fetchPaymentMethods();
        } catch (error) {
            console.error('Error setting default payment method:', error);
            toast.error('Failed to update default payment method');
        }
    };

    // JSX remains mostly the same but we'll update the forms
    return (
        <><Header />
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
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
                                                value={newCardInfo.cardNumber}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, cardNumber: e.target.value })}
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
                                                value={newCardInfo.cardHolderName}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, cardHolderName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Expiry Month
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM"
                                                value={newCardInfo.expiryMonth}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, expiryMonth: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Expiry Year
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="YY"
                                                value={newCardInfo.expiryYear}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, expiryYear: e.target.value })}
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
                                                value={newCardInfo.cvv}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, cvv: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Card Type
                                            </label>
                                            <select
                                                value={newCardInfo.cardType}
                                                onChange={(e) => setNewCardInfo({ ...newCardInfo, cardType: e.target.value })}
                                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="Visa">Visa</option>
                                                <option value="Mastercard">Mastercard</option>
                                                <option value="Amex">American Express</option>
                                                <option value="Discover">Discover</option>
                                            </select>
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
                                    {isLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : paymentMethods.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No payment methods added yet.</p>
                                    ) : (
                                        paymentMethods.map((method) => (
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
                                        ))
                                    )}
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
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        setIsLoading(true);
                                        const { error } = await supabase.auth.resetPasswordForEmail(
                                            user?.email || '',
                                            {
                                                redirectTo: `${window.location.origin}/reset-password`,
                                            }
                                        );

                                        if (error) {
                                            throw error;
                                        }

                                        toast.success('Password reset email sent. Please check your inbox.');
                                    } catch (error) {
                                        console.error('Error sending password reset:', error);
                                        toast.error('Failed to send password reset email');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Key className="h-4 w-4 mr-2" />
                                )}
                                Reset Password
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}