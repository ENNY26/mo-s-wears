// pages/Addresses.jsx
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const Addresses = () => {
  const { userProfile, addAddress, updateAddress, setDefaultAddress, deleteAddress } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const addressData = {
      name: formData.name,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      phone: formData.phone
    };

    let success;
    if (editingAddress) {
      success = await updateAddress(editingAddress.id, addressData);
      if (success) {
        toast.success('Address updated successfully!');
        setEditingAddress(null);
      }
    } else {
      success = await addAddress(addressData);
      if (success) {
        toast.success('Address added successfully!');
        setShowAddForm(false);
      }
    }

    if (success) {
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
        isDefault: false
      });
    } else {
      toast.error('Failed to save address');
    }
  };

  const handleSetDefault = async (addressId) => {
    const success = await setDefaultAddress(addressId);
    if (success) {
      toast.success('Default address updated!');
    } else {
      toast.error('Failed to update default address');
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const success = await deleteAddress(addressId);
      if (success) {
        toast.success('Address deleted successfully!');
      } else {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingAddress(null);
                setFormData({
                  name: '',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: 'United States',
                  phone: '',
                  isDefault: false
                });
              }}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Add New Address
            </button>
          </div>

          <div className="p-6">
            {/* Add/Edit Address Form */}
            {showAddForm && (
              <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                    >
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAddress(null);
                      }}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {userProfile?.addresses?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No addresses saved yet.</p>
                </div>
              ) : (
                userProfile?.addresses?.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{address.name}</h3>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                        <p className="text-gray-600">{address.phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addresses;