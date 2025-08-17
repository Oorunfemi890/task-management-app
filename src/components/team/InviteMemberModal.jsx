import React, { useState } from 'react';
import { X, Mail, UserPlus, Copy, Check, AlertCircle } from 'lucide-react';
import { useTask } from '@context/TaskContext';

const InviteMemberModal = ({ isOpen, onClose }) => {
  const { inviteTeamMember } = useTask();
  const [inviteMethod, setInviteMethod] = useState('email'); // 'email' or 'link'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitesSent, setInvitesSent] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [formData, setFormData] = useState({
    emails: [''],
    role: 'member',
    message: 'You have been invited to join our team on TaskFlow. Click the link below to get started!'
  });
  const [errors, setErrors] = useState({});

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData(prev => ({ ...prev, emails: newEmails }));
    
    // Clear error for this email
    if (errors[`email-${index}`]) {
      setErrors(prev => ({ ...prev, [`email-${index}`]: '' }));
    }
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const validateEmails = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    formData.emails.forEach((email, index) => {
      if (email.trim() && !emailRegex.test(email.trim())) {
        newErrors[`email-${index}`] = 'Invalid email address';
      }
    });

    const validEmails = formData.emails.filter(email => email.trim() && emailRegex.test(email.trim()));
    if (validEmails.length === 0) {
      newErrors.general = 'Please enter at least one valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvites = async () => {
    if (!validateEmails()) return;

    setIsSubmitting(true);
    const validEmails = formData.emails.filter(email => email.trim());
    
    try {
      const results = [];
      for (const email of validEmails) {
        try {
          await inviteTeamMember({
            email: email.trim(),
            role: formData.role,
            message: formData.message
          });
          results.push({ email: email.trim(), status: 'success' });
        } catch (error) {
          results.push({ email: email.trim(), status: 'error', error: error.message });
        }
      }
      
      setInvitesSent(results);
      
      // Reset form for successful invites
      const successfulInvites = results.filter(r => r.status === 'success');
      if (successfulInvites.length > 0) {
        setFormData(prev => ({
          ...prev,
          emails: ['']
        }));
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInviteLink = () => {
    // In a real app, this would call an API to generate a unique invite link
    const link = `${window.location.origin}/invite?token=abc123xyz&role=${formData.role}`;
    setInviteLink(link);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Invite Team Members</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Invite Method Toggle */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setInviteMethod('email')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    inviteMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Invite
                </button>
                <button
                  onClick={() => setInviteMethod('link')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    inviteMethod === 'link'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Invite Link
                </button>
              </div>
            </div>

            {inviteMethod === 'email' ? (
              <>
                {/* Email Invites */}
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="input-field"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Email Addresses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Addresses
                    </label>
                    <div className="space-y-2">
                      {formData.emails.map((email, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                            className={`flex-1 input-field ${errors[`email-${index}`] ? 'input-field-error' : ''}`}
                            placeholder="colleague@company.com"
                          />
                          {formData.emails.length > 1 && (
                            <button
                              onClick={() => removeEmailField(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {errors.general && (
                      <p className="mt-1 text-sm text-red-600">{errors.general}</p>
                    )}
                    
                    <button
                      onClick={addEmailField}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                    >
                      + Add another email
                    </button>
                  </div>

                  {/* Custom Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="Add a personal message to your invitation..."
                    />
                  </div>

                  {/* Send Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInvites}
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invites
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Invite Results */}
                {invitesSent.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Invite Results</h4>
                    <div className="space-y-2">
                      {invitesSent.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-md ${
                            result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <span className="text-sm text-gray-900">{result.email}</span>
                          {result.status === 'success' ? (
                            <span className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs">Sent</span>
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Failed</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Invite Link */}
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role for invited members
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="input-field"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Generate Link */}
                  {!inviteLink ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Generate an invite link
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a shareable link that allows people to join your team.
                      </p>
                      <button
                        onClick={generateInviteLink}
                        className="btn-primary"
                      >
                        Generate Link
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invite Link
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={inviteLink}
                          readOnly
                          className="flex-1 input-field bg-gray-50"
                        />
                        <button
                          onClick={copyInviteLink}
                          className={`px-3 py-2 rounded-md border transition-colors ${
                            linkCopied
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {linkCopied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Link Details:</p>
                            <ul className="text-xs space-y-1">
                              <li>• This link will expire in 7 days</li>
                              <li>• Anyone with this link can join as a {formData.role}</li>
                              <li>• You can revoke this link at any time</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setInviteLink('')}
                          className="btn-outline"
                        >
                          Generate New Link
                        </button>
                        <button
                          onClick={onClose}
                          className="btn-primary"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {errors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;