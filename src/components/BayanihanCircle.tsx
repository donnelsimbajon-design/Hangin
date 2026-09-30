import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  Sparkles,
  Send,
  AlertCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ForumPost, PetSpecies } from '../types';

interface BayanihanCircleProps {
  posts: ForumPost[];
  activeChannel: string;
  userSpecies: PetSpecies;
  userName: string;
  onSelectChannel: (channel: string) => void;
  onAddPost: (channel: string, text: string) => void;
  onValidatePost: (postId: string) => void;
  onSendVibes: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onTriggerCrisisSafety: () => void;
}

export const BayanihanCircle: React.FC<BayanihanCircleProps> = ({
  posts,
  activeChannel,
  userSpecies,
  userName,
  onSelectChannel,
  onAddPost,
  onValidatePost,
  onSendVibes,
  onAddComment,
  onTriggerCrisisSafety,
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const channels = [
    { id: 'all', name: 'All Spaces' },
    { id: 'h/ScreenFreeLiving', name: 'Screen-Free Living' },
    { id: 'h/StressSupport', name: 'Stress & Anxiety' },
    { id: 'h/StudyFocus', name: 'Study & Gentle Focus' },
    { id: 'h/GentleHabits', name: 'Gentle Habits' },
  ];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // Safety intercept
    const textLower = newPostText.toLowerCase();
    const riskPhrases = ['harm myself', 'hurt myself', 'kill myself', 'suicide', 'end my life', 'want to die'];
    if (riskPhrases.some((p) => textLower.includes(p))) {
      onTriggerCrisisSafety();
      return;
    }

    const targetChannel = activeChannel === 'all' ? 'h/StressSupport' : activeChannel;
    onAddPost(targetChannel, newPostText.trim());
    setNewPostText('');
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
    setActiveCommentPostId(null);
  };

  const filteredPosts = posts.filter((p) => {
    const matchChannel = activeChannel === 'all' || p.channel === activeChannel;
    const matchSearch =
      !searchQuery ||
      p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchChannel && matchSearch;
  });

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#182a22] border border-[#d7e6dc] dark:border-[#244137] p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4eee8] dark:border-[#244137] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
              Bayanihan Circle
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Vetted, compassionate peer support &bull; Mutual encouragement
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/60 dark:text-emerald-300/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circle..."
            className="w-full sm:w-44 pl-8 pr-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-[#182a22] border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-100 focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Channel Filters */}
      <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChannel(ch.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              activeChannel === ch.id
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-emerald-50 dark:bg-[#182a22] text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900'
            }`}
          >
            {ch.name}
          </button>
        ))}
      </div>

      {/* Post Composer */}
      <form onSubmit={handlePostSubmit} className="my-3 p-3.5 rounded-2xl bg-[#f4f8f5] dark:bg-[#182a22] border border-emerald-200/70 dark:border-emerald-800/40">
        <textarea
          rows={2}
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Share a gentle reflection or encouragement with the circle..."
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#182a22] border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-700/50 resize-none focus:outline-emerald-600"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Posting as @{userName} ({userSpecies})
          </span>
          <button
            type="submit"
            disabled={!newPostText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Feed List */}
      <div className="space-y-3 mt-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#182a22] border border-[#e2ece6] dark:border-[#244137] shadow-2xs"
          >
            {/* Author bar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs">
                  {post.species === 'dog' ? '🐶' : '🐱'}
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                    @{post.author}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70">
                    in {post.channel}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
              {post.text}
            </p>

            {/* Action Bar */}
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#e7efe9] dark:border-[#244137]">
              <button
                onClick={() => onValidatePost(post.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  post.hasValidated
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                    : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                <span>Validate ({post.validates})</span>
              </button>

              <button
                onClick={() => onSendVibes(post.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  post.hasSentVibes
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                    : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Good Vibes ({post.vibes})</span>
              </button>

              <button
                onClick={() =>
                  setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                }
                className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                <span>Reply ({post.comments.length})</span>
              </button>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="mt-3 space-y-1.5 pl-4 border-l-2 border-emerald-100 dark:border-emerald-900">
                {post.comments.map((c) => (
                  <div key={c.id} className="text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 mr-1.5">
                      @{c.author}:
                    </span>
                    {c.text}
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {activeCommentPostId === post.id && (
              <div className="flex gap-2 mt-3 pt-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Send a supportive message..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#f4f8f5] dark:bg-[#182a22] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 focus:outline-emerald-600"
                />
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
