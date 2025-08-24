import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Send,
  Image,
  Paperclip,
  Smile,
  MoreHorizontal,
  Edit3,
  Trash2,
  Reply,
  Archive,
  Search,
  X,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@context/AuthContext";
import { socketService } from "@services/socketService";

const ProjectChat = ({ project, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && project) {
      fetchMessages();
      fetchParticipants();

      // Join project chat room
      socketService.socket?.emit("project:join", project.id);

      // Listen for real-time updates
      socketService.onProjectMessageReceived((data) => {
        if (data.projectId === project.id) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      });

      socketService.onProjectMessageEdited((data) => {
        if (data.projectId === project.id) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
          );
        }
      });

      socketService.onProjectMessageDeleted((data) => {
        if (data.projectId === project.id) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== data.messageId)
          );
        }
      });

      socketService.onProjectMessageReactionUpdated((data) => {
        if (data.projectId === project.id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, reactions: data.reactions }
                : msg
            )
          );
        }
      });

      return () => {
        socketService.socket?.emit("project:leave", project.id);
      };
    }
  }, [isOpen, project]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${project.id}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(
        `/api/projects/${project.id}/messages/participants`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch participants");

      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !replyingTo) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          replyTo: replyingTo?.id || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const response = await fetch(
        `/api/projects/${project.id}/messages/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
          body: JSON.stringify({ message: newContent }),
        }
      );

      if (!response.ok) throw new Error("Failed to edit message");

      const updatedMessage = await response.json();
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );
      setEditingMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const response = await fetch(
        `/api/projects/${project.id}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const uploadFile = async (file, messageType = "file") => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "message",
        `Shared ${messageType === "image" ? "an image" : "a file"}: ${
          file.name
        }`
      );

      const response = await fetch(
        `/api/projects/${project.id}/messages/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload file");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      uploadFile(file, isImage ? "image" : "file");
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const response = await fetch(
        `/api/projects/${project.id}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!response.ok) throw new Error("Failed to add reaction");
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `/api/projects/${project.id}/messages/search?query=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("taskflow_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search messages");

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  };

  const MessageItem = ({ message, isOwn }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    const canEdit = isOwn && message.message_type === "text";
    const canDelete = isOwn || user.role === "admin" || user.role === "manager";

    return (
      <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex max-w-xs lg:max-w-md ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {message.user_avatar ||
                  message.user_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Message Content */}
          <div className={`mx-2 ${isOwn ? "text-right" : ""}`}>
            {/* User name and timestamp */}
            <div
              className={`text-xs text-gray-500 mb-1 ${
                isOwn ? "text-right" : ""
              }`}
            >
              <span className="font-medium">{message.user_name}</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                })}
              </span>
              {message.is_edited && (
                <span className="ml-1 text-gray-400">(edited)</span>
              )}
            </div>

            {/* Reply preview */}
            {message.reply_to && (
              <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-2 border-primary-500">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Replying to {message.reply_user_name}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {message.reply_message}
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`relative px-4 py-2 rounded-lg ${
                isOwn
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {/* Message content based on type */}
              {message.message_type === "text" && (
                <div className="text-sm whitespace-pre-wrap">
                  {message.message}
                </div>
              )}

              {message.message_type === "image" && (
                <div>
                  <img
                    src={message.attachment_url}
                    alt={message.attachment_name}
                    className="max-w-full h-auto rounded-lg mb-2"
                    loading="lazy"
                  />
                  {message.message !== message.attachment_name && (
                    <div className="text-sm">{message.message}</div>
                  )}
                </div>
              )}

              {message.message_type === "file" && (
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">
                      {message.attachment_name}
                    </div>
                    {message.attachment_size && (
                      <div className="text-xs opacity-75">
                        {(message.attachment_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                  <a
                    href={message.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:no-underline"
                  >
                    Download
                  </a>
                </div>
              )}

              {/* Message menu */}
              <div className="absolute -top-2 -right-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isOwn ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <button
                      onClick={() => {
                        setReplyingTo(message);
                        setShowMenu(false);
                        messageInputRef.current?.focus();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </button>

                    <button
                      onClick={() => setShowReactions(!showReactions)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Smile className="h-4 w-4 mr-2" />
                      React
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingMessage({
                            id: message.id,
                            content: message.message,
                          });
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => {
                          deleteMessage(message.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => addReaction(message.id, reaction.emoji)}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                      reaction.users.some((u) => u.id === user.id)
                        ? "bg-primary-100 border-primary-300 text-primary-800"
                        : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-1">{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick reactions */}
            {showReactions && (
              <div className="flex space-x-1 mt-2">
                {["👍", "❤️", "😀", "😲", "😢", "😠"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      addReaction(message.id, emoji);
                      setShowReactions(false);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {project.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h2>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {participants.filter((p) => p.is_online).length} online
                  </span>
                  <span className="mx-2">•</span>
                  <span>{participants.length} members</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Users className="h-5 w-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchMessages()}
                placeholder="Search messages..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={searchMessages}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm"
              >
                Search
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="spinner" />
                </div>
              ) : (
                <>
                  {searchResults.length > 0 ? (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Search results for "{searchQuery}":
                      </div>
                      {searchResults.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          isOwn={message.user_id === user.id}
                        />
                      ))}
                      <button
                        onClick={() => setSearchResults([])}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        Clear search results
                      </button>
                    </div>
                  ) : (
                    <div className="group">
                      {messages.map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          isOwn={message.user_id === user.id}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Replying to {replyingTo.user_name}
                    </span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {replyingTo.message.substring(0, 50)}...
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Message input */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {editingMessage ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editingMessage.content}
                    onChange={(e) =>
                      setEditingMessage((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        editMessage(editingMessage.id, editingMessage.content);
                      } else if (e.key === "Escape") {
                        setEditingMessage(null);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Edit message..."
                    autoFocus
                  />
                  <button
                    onClick={() =>
                      editMessage(editingMessage.id, editingMessage.content)
                    }
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingMessage(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Type a message..."
                    disabled={isUploading}
                  />

                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Image className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isUploading}
                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Uploading file...
                </div>
              )}
            </div>
          </div>

          {/* Participants sidebar */}
          {showParticipants && (
            <div className="w-64 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Participants ({participants.length})
                </h3>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {participant.avatar ||
                              participant.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-750 ${
                            participant.status === "online" ||
                            participant.is_online
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {participant.name}
                          {participant.id === user.id && " (You)"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {participant.in_current_project
                            ? "In this project"
                            : participant.status === "online" ||
                              participant.is_online
                            ? "Online"
                            : participant.last_seen
                            ? `Last seen ${formatDistanceToNow(
                                new Date(participant.last_seen),
                                { addSuffix: true }
                              )}`
                            : "Offline"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*"
      />
    </div>
  );
};

export default ProjectChat;
