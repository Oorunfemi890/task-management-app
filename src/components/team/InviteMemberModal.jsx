// src/components/team/InviteMemberModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  UserPlus,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { inviteApi } from "@/api/endpoints/inviteApi";
import toast from "react-hot-toast";

const InviteMemberModal = ({ isOpen, onClose }) => {
  const [inviteMethod, setInviteMethod] = useState("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [inviteResults, setInviteResults] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [formData, setFormData] = useState({
    emails: [""],
    roleId: null,
    message:
      "You have been invited to join our team on TaskFlow. Click the link below to get started!",
  });

  const [errors, setErrors] = useState({});

  // Fetch available roles when modal opens
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await inviteApi.getAvailableRoles();
        setAvailableRoles(roles);
        // Set default role to member if available
        const memberRole = roles.find((role) => role.name === "member");
        if (memberRole) {
          setFormData((prev) => ({ ...prev, roleId: memberRole.id }));
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to load available roles");
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData((prev) => ({ ...prev, emails: newEmails }));

    // Clear error for this email
    if (errors[`email-${index}`]) {
      setErrors((prev) => ({ ...prev, [`email-${index}`]: "" }));
    }
  };

  const addEmailField = () => {
    setFormData((prev) => ({
      ...prev,
      emails: [...prev.emails, ""],
    }));
  };

  const removeEmailField = (index) => {
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  };

  const validateEmails = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    formData.emails.forEach((email, index) => {
      if (email.trim() && !emailRegex.test(email.trim())) {
        newErrors[`email-${index}`] = "Invalid email address";
      }
    });

    const validEmails = formData.emails.filter(
      (email) => email.trim() && emailRegex.test(email.trim())
    );
    if (validEmails.length === 0) {
      newErrors.general = "Please enter at least one valid email address";
    }

    if (!formData.roleId) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInvites = async () => {
    if (!validateEmails()) return;

    setIsSubmitting(true);
    try {
      const validEmails = formData.emails.filter((email) => email.trim());
      const response = await inviteApi.sendInvitations({
        emails: validEmails,
        roleId: formData.roleId,
        message: formData.message,
      });

      setInviteResults(response.results);

      // Show summary toast
      const successful = response.results.filter(
        (r) => r.status === "success"
      ).length;
      const failed = response.results.filter(
        (r) => r.status === "error"
      ).length;

      if (successful > 0) {
        toast.success(`${successful} invitation(s) sent successfully!`);
      }
      if (failed > 0) {
        toast.error(`${failed} invitation(s) failed to send`);
      }

      // Reset successful emails
      const successfulEmails = response.results
        .filter((r) => r.status === "success")
        .map((r) => r.email);

      setFormData((prev) => ({
        ...prev,
        emails: prev.emails.filter(
          (email) => !successfulEmails.includes(email.trim().toLowerCase())
        ),
      }));
    } catch (error) {
      console.error("Error sending invitations:", error);
      if (error.status === 429) {
        toast.error("Too many invitations sent. Please try again later.");
      } else if (error.status === 403) {
        toast.error("You do not have permission to send invitations.");
      } else {
        toast.error("Failed to send invitations");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInviteLink = async () => {
    if (!formData.roleId) {
      toast.error("Please select a role first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await inviteApi.generateInviteLink({
        roleId: formData.roleId,
        expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxUses: null, // unlimited
      });

      setInviteLink(response);
      toast.success("Invite link generated successfully!");
    } catch (error) {
      console.error("Error generating invite link:", error);
      if (error.status === 403) {
        toast.error("You do not have permission to create invite links.");
      } else {
        toast.error("Failed to generate invite link");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink.link);
      setLinkCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const resetForm = () => {
    setFormData({
      emails: [""],
      roleId: availableRoles.find((r) => r.name === "member")?.id || null,
      message:
        "You have been invited to join our team on TaskFlow. Click the link below to get started!",
    });
    setInviteResults([]);
    setInviteLink(null);
    setLinkCopied(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Invite Team Members
              </h3>
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
                  onClick={() => setInviteMethod("email")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    inviteMethod === "email"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Invite
                </button>
                <button
                  onClick={() => setInviteMethod("link")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    inviteMethod === "link"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Invite Link
                </button>
              </div>
            </div>

            {inviteMethod === "email" ? (
              <>
                {/* Email Invites */}
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.roleId || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          roleId: parseInt(e.target.value),
                        }))
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.role ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select a role</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.charAt(0).toUpperCase() +
                            role.name.slice(1)}
                          {role.description && ` - ${role.description}`}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>

                  {/* Email Addresses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Addresses *
                    </label>
                    <div className="space-y-2">
                      {formData.emails.map((email, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                              handleEmailChange(index, e.target.value)
                            }
                            className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors[`email-${index}`] ? "border-red-300" : ""
                            }`}
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
                      <p className="mt-1 text-sm text-red-600">
                        {errors.general}
                      </p>
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Add a personal message to your invitation..."
                    />
                  </div>

                  {/* Send Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInvites}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                {inviteResults.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Invite Results
                    </h4>
                    <div className="space-y-2">
                      {inviteResults.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-md ${
                            result.status === "success"
                              ? "bg-green-50"
                              : "bg-red-50"
                          }`}
                        >
                          <span className="text-sm text-gray-900">
                            {result.email}
                          </span>
                          {result.status === "success" ? (
                            <span className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs">Sent</span>
                            </span>
                          ) : (
                            <span
                              className="flex items-center text-red-600"
                              title={result.message}
                            >
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
                      Role for invited members *
                    </label>
                    <select
                      value={formData.roleId || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          roleId: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a role</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.charAt(0).toUpperCase() +
                            role.name.slice(1)}
                          {role.description && ` - ${role.description}`}
                        </option>
                      ))}
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
                        Create a shareable link that allows people to join your
                        team.
                      </p>
                      <button
                        onClick={generateInviteLink}
                        disabled={isSubmitting || !formData.roleId}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Link"
                        )}
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
                          value={inviteLink.link}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <button
                          onClick={copyInviteLink}
                          className={`px-3 py-2 rounded-md border transition-colors ${
                            linkCopied
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
                              <li>
                                • Anyone with this link can join as a{" "}
                                {inviteLink.roleName}
                              </li>
                              <li>• Usage: Unlimited</li>
                              <li>• You can revoke this link at any time</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setInviteLink(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Generate New Link
                        </button>
                        <button
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
