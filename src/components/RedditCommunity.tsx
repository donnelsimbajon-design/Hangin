import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  X,
  Send,
  Flag,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowBigUp,
  ArrowBigDown,
  Award,
  Flame,
  Clock,
  TrendingUp,
  Bookmark,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ForumPost, ForumComment, ForumAward, PetSpecies, Subforum } from '../types';

interface RedditCommunityProps {
  posts: ForumPost[];
  activeChannel: string;
  userSpecies: PetSpecies;
  userName: string;
  customSubforums?: Subforum[];
  onSelectChannel: (channel: string) => void;
  onAddPost: (channel: string, text: string, mediaUrl?: string, title?: string) => void;
  onVotePost: (postId: string, direction: 'up' | 'down') => void;
  onGiveAward: (postId: string, awardName: string, icon: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onCreateSubforum?: (subforum: Subforum) => void;
  onAddPoints?: (amount: number) => void;
  onTriggerCrisisSafety: () => void;
}

const AVAILABLE_AWARDS = [
  { id: 'wholesome', icon: '🏆', name: 'Wholesome' },
  { id: 'hugz', icon: '🫂', name: 'Warm Hug' },
  { id: 'fresh', icon: '🌱', name: 'Fresh Air' },
  { id: 'mindful', icon: '✨', name: 'Mindful Spark' },
  { id: 'shield', icon: '🛡️', name: 'Shielded' },
];

export const RedditCommunity: React.FC<RedditCommunityProps> = ({
  posts,
  activeChannel,
  userSpecies,
  userName,
  customSubforums = [],
  onSelectChannel,
  onAddPost,
  onVotePost,
  onGiveAward,
  onAddComment,
  onCreateSubforum,
  onAddPoints,
  onTriggerCrisisSafety,
}) => {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedChannelForPost, setSelectedChannelForPost] = useState('h/gentleminds');
  const [selectedFlair, setSelectedFlair] = useState('🌿 Wholesome');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [awardPickerPostId, setAwardPickerPostId] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subforum creation state (§IV.5 Specification)
  const [isCreateSubforumOpen, setIsCreateSubforumOpen] = useState(false);
  const [newSubforumName, setNewSubforumName] = useState('');
  const [newSubforumDesc, setNewSubforumDesc] = useState('');
  const [newSubforumIcon, setNewSubforumIcon] = useState('🌸');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const defaultChannels: Subforum[] = [
    { id: 'all', name: 'h/all', icon: '🌐', desc: 'All mindful feeds', owner: 'Hangin' },
    { id: 'h/gentleminds', name: 'h/gentleminds', icon: '🌸', desc: 'Calm thoughts & grounding', owner: 'Hangin' },
    { id: 'h/smallwins', name: 'h/smallwins', icon: '✨', desc: 'Celebrate healthy habits', owner: 'Hangin' },
    { id: 'h/digitaldetox', name: 'h/digitaldetox', icon: '🍃', desc: 'Screen time reduction tips', owner: 'Hangin' },
    { id: 'h/venting', name: 'h/venting', icon: '🫂', desc: 'Safe empathetic venting', owner: 'Hangin' },
    { id: 'h/furryfriends', name: 'h/furryfriends', icon: '🐾', desc: 'Companion pet stories', owner: 'Hangin' },
  ];

  const allChannels: Subforum[] = [...defaultChannels, ...customSubforums];
  const currentSubforum = allChannels.find((c) => c.id === activeChannel);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubforumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSubforumName.trim().replace(/^h\//, '').toLowerCase().replace(/\s+/g, '');
    if (!cleanName) return;

    const formattedId = `h/${cleanName}`;
    const newSub: Subforum = {
      id: formattedId,
      name: formattedId,
      icon: newSubforumIcon || '🌱',
      desc: newSubforumDesc.trim() || 'A supportive sanctuary subforum',
      owner: userName.replace(/^u\//, ''),
      isCustom: true,
    };

    if (onCreateSubforum) {
      onCreateSubforum(newSub);
    }
    onSelectChannel(formattedId);
    onAddPoints?.(5);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    showToast(`Created ${formattedId}! +5 WP earned! 🎉`);
    setNewSubforumName('');
    setNewSubforumDesc('');
    setIsCreateSubforumOpen(false);
  };

  const handleSharePost = (post: ForumPost) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}/#community/${post.channel}/${post.id}`);
      }
    } catch {}
    onAddPoints?.(2);
    showToast('Link copied to clipboard! +2 WP awarded! 🌿');
  };

  const handleVoteWithPoints = (postId: string, direction: 'up' | 'down') => {
    onVotePost(postId, direction);
    if (direction === 'up') {
      onAddPoints?.(1);
      showToast('+1 WP earned for spreading warmth! ✨');
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostTitle.trim()) return;

    const fullText = (newPostTitle + ' ' + newPostText).toLowerCase();
    const crisisKeywords = [
      'harm myself',
      'hurt myself',
      'kill myself',
      'suicide',
      'end my life',
      'want to die',
    ];
    if (crisisKeywords.some((k) => fullText.includes(k))) {
      onTriggerCrisisSafety();
    }

    const titleWithFlair = `[${selectedFlair}] ${newPostTitle.trim() || 'Mindful Reflection'}`;
    onAddPost(selectedChannelForPost, newPostText.trim(), attachedImage || undefined, titleWithFlair);

    onAddPoints?.(5);
    setNewPostTitle('');
    setNewPostText('');
    setAttachedImage(null);
    setIsCreatePostOpen(false);
    showToast('Posted to ' + selectedChannelForPost + '! +5 WP earned! 🍃');
  };

  const handleAddCommentSubmit = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    onAddPoints?.(2);
    setCommentInput('');
    showToast('Comment added! +2 WP earned! 💬');
  };

  const filteredPosts = posts
    .filter((p) => {
      if (activeChannel !== 'all' && p.channel !== activeChannel) return false;
      const postBody = p.content || p.text || '';
      if (
        searchQuery.trim() &&
        !postBody.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortFilter === 'hot') {
        const scoreA = (a.votes?.up || a.score || 0) + (a.comments?.length || 0) * 2;
        const scoreB = (b.votes?.up || b.score || 0) + (b.comments?.length || 0) * 2;
        return scoreB - scoreA;
      }
      if (sortFilter === 'top') {
        const netA = (a.votes?.up || a.score || 0) - (a.votes?.down || 0);
        const netB = (b.votes?.up || b.score || 0) - (b.votes?.down || 0);
        return netB - netA;
      }
      return Number(b.timestamp) - Number(a.timestamp);
    });

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-4 space-y-4 select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-800 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          REDDIT-STYLE H/ COMMUNITY HEADER BAR
          ============================================================ */}
      <div className="rounded-2xl bg-white dark:bg-[#112017] p-3 sm:p-4 border-2 border-slate-200 dark:border-emerald-800/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
            h/
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
              <span>h/ Safe Haven</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Reddit-Style Safe Haven
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400/80">
              A cozy Reddit-style safe haven! Browse h/gentleminds, h/smallwins, and share honest reflections with upvotes &amp; gentle awards.
            </p>
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-xs tracking-wider uppercase shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post in h/</span>
        </button>
      </div>

      {/* Search & Channel Navigation Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search h/Hangin posts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#112017] border border-slate-200 dark:border-emerald-800/80 text-xs text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
          />
        </div>

        {/* Sub-hangin Pills + Create Subforum Button */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
          {allChannels.map((ch) => {
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#ff4500] text-white shadow-xs'
                    : 'bg-white dark:bg-[#112017] text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 hover:bg-slate-50'
                }`}
              >
                <span>{ch.icon}</span>
                <span>{ch.name}</span>
              </button>
            );
          })}

          {/* + Create Subforum Button (§IV.5 Specification) */}
          <button
            onClick={() => setIsCreateSubforumOpen(true)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
            title="Create and own a new h/ subforum"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Subforum</span>
          </button>
        </div>

        {/* Subforum Info & Moderator Header (when a specific subforum is selected) */}
        {currentSubforum && activeChannel !== 'all' && (
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">{currentSubforum.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-50 truncate">
                    {currentSubforum.name}
                  </h4>
                  {currentSubforum.owner && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-emerald-700/40 shrink-0">
                      Owned by u/{currentSubforum.owner}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-tight mt-0.5 truncate">
                  {currentSubforum.desc}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap bg-white/80 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-2xs shrink-0 ml-2">
              Peer Space
            </span>
          </div>
        )}
      </div>

      {/* Sorting Tabs: Hot, New, Top (Authentic Reddit Style) */}
      <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500 dark:text-emerald-400">
        <button
          onClick={() => setSortFilter('hot')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'hot'
              ? 'bg-slate-200 dark:bg-emerald-900 text-orange-600 dark:text-orange-400'
              : 'hover:text-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSortFilter('new')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'new'
              ? 'bg-slate-200 dark:bg-emerald-900 text-blue-600 dark:text-blue-400'
              : 'hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSortFilter('top')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'top'
              ? 'bg-slate-200 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
              : 'hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      </div>

      {/* ============================================================
          REDDIT-STYLE FEED OF POST CARDS
          ============================================================ */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const upvotes = post.votes?.up ?? (post.score > 0 ? post.score : 0);
          const downvotes = post.votes?.down ?? (post.score < 0 ? Math.abs(post.score) : 0);
          const score = post.votes ? upvotes - downvotes : post.score ?? 0;
          const userVote = post.userVote;
          const commentCount = post.comments?.length || 0;

          return (
            <div
              key={post.id}
              className="rounded-2xl bg-white dark:bg-[#112017] border border-slate-200 dark:border-emerald-800/80 shadow-xs hover:border-slate-300 dark:hover:border-emerald-700 transition-all flex flex-col overflow-hidden"
            >
              <div className="flex">
                {/* Left Upvote/Downvote Column (Reddit Style) */}
                <div className="w-12 bg-slate-50/70 dark:bg-[#0d1812]/50 p-2 flex flex-col items-center justify-start shrink-0 border-r border-slate-100 dark:border-emerald-900/60 pt-3">
                  <button
                    onClick={() => handleVoteWithPoints(post.id, 'up')}
                    className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-emerald-900 cursor-pointer transition-colors ${
                      userVote === 'up' ? 'text-[#ff4500]' : 'text-slate-400 hover:text-[#ff4500]'
                    }`}
                    title="Upvote"
                  >
                    <ArrowBigUp className={`w-6 h-6 ${userVote === 'up' ? 'fill-current' : ''}`} />
                  </button>

                  <span
                    className={`text-xs font-black my-0.5 ${
                      userVote === 'up'
                        ? 'text-[#ff4500]'
                        : userVote === 'down'
                        ? 'text-[#7193ff]'
                        : 'text-slate-700 dark:text-emerald-300'
                    }`}
                  >
                    {score}
                  </span>

                  <button
                    onClick={() => onVotePost(post.id, 'down')}
                    className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-emerald-900 cursor-pointer transition-colors ${
                      userVote === 'down' ? 'text-[#7193ff]' : 'text-slate-400 hover:text-[#7193ff]'
                    }`}
                    title="Downvote"
                  >
                    <ArrowBigDown className={`w-6 h-6 ${userVote === 'down' ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Main Post Body */}
                <div className="flex-1 p-3 sm:p-4 text-left">
                  {/* Post Subreddit & Author Metadata */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-emerald-400/80 mb-1.5 flex-wrap">
                    <span className="font-extrabold text-slate-800 dark:text-emerald-200 hover:underline cursor-pointer">
                      {post.channel}
                    </span>
                    <span>•</span>
                    <span>Posted by u/{post.authorName || post.author || 'GentleUser'}</span>
                    <span>•</span>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                  </div>

                  {/* Post Title */}
                  {post.title && (
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-emerald-50 mb-1.5 leading-snug">
                      {post.title}
                    </h3>
                  )}

                  {/* Post Content */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-emerald-200/90 leading-relaxed whitespace-pre-wrap">
                    {post.content || post.text}
                  </p>

                  {/* Attached Media */}
                  {post.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden max-h-80 border border-slate-200 dark:border-emerald-800">
                      <img
                        src={post.mediaUrl}
                        alt="Attached media"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Awards row */}
                  {post.awards && post.awards.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {post.awards.map((aw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 font-semibold"
                        >
                          <span>{aw.icon}</span>
                          <span>{aw.name}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Reddit Action Bar */}
                  <div className="flex items-center gap-3 sm:gap-4 mt-3 pt-2 text-xs text-slate-500 dark:text-emerald-400 font-bold border-t border-slate-100 dark:border-emerald-900/40">
                    {/* Comments Button */}
                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{commentCount} Comments</span>
                    </button>

                    {/* Give Award Button */}
                    <button
                      onClick={() =>
                        setAwardPickerPostId(
                          awardPickerPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Award</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                      title="Share post & copy link (+2 WP)"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share (+2 WP)</span>
                    </button>
                  </div>

                  {/* Award Picker Popover */}
                  {awardPickerPostId === post.id && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/80 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-around gap-2">
                      {AVAILABLE_AWARDS.map((aw) => (
                        <button
                          key={aw.id}
                          onClick={() => {
                            onGiveAward(post.id, aw.name, aw.icon);
                            setAwardPickerPostId(null);
                            onAddPoints?.(3);
                            showToast(`Gave ${aw.name} award! +3 WP earned! 🏆`);
                          }}
                          className="flex flex-col items-center p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900 cursor-pointer transition-transform hover:scale-110"
                        >
                          <span className="text-xl">{aw.icon}</span>
                          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 mt-1">
                            {aw.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Interactive Comments Drawer */}
                  {activeCommentPostId === post.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-emerald-800 space-y-3">
                      {/* Add Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Write a kind, mindful reply..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-950/70 border border-slate-300 dark:border-emerald-700 text-xs text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
                        />
                        <button
                          onClick={() => handleAddCommentSubmit(post.id)}
                          className="px-3 py-2 rounded-xl bg-[#58cc02] text-white font-bold text-xs hover:bg-[#46a302] cursor-pointer transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Comment list */}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((cmt) => (
                            <div
                              key={cmt.id}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-100 dark:border-emerald-800/60 text-xs"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-emerald-200 text-[11px] mb-1">
                                <span>u/{cmt.authorName || cmt.author || 'MindfulFriend'}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-400 font-normal">
                                  {new Date(cmt.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-emerald-300/90">{cmt.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-emerald-400 italic py-2 text-center">
                            No comments yet. Be the first to share warmth!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          CREATE POST MODAL (AUTHENTIC REDDIT STYLE FOR H/)
          ============================================================ */}
      <AnimatePresence>
        {isCreatePostOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#112017] rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-emerald-700 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-sm">
                    h/
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-emerald-100">
                    Create a post in Hangin
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatePostOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-hangin Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-emerald-300 block mb-1">
                  Choose a Circle
                </label>
                <select
                  value={selectedChannelForPost}
                  onChange={(e) => setSelectedChannelForPost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-xs font-bold text-slate-800 dark:text-emerald-100 focus:outline-none"
                >
                  <option value="h/gentleminds">h/gentleminds - Calm thoughts</option>
                  <option value="h/smallwins">h/smallwins - Habit victories</option>
                  <option value="h/digitaldetox">h/digitaldetox - Screen limits</option>
                  <option value="h/venting">h/venting - Safe venting</option>
                  <option value="h/furryfriends">h/furryfriends - Companion tales</option>
                </select>
              </div>

              {/* Flair selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-emerald-300 block mb-1">
                  Select Flair
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['🌿 Wholesome', '🎉 Small Win', '💡 Tip', '🫂 Support', '🍃 Detox'].map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setSelectedFlair(fl)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        selectedFlair === fl
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="An interesting title..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
                />
              </div>

              {/* Text Body */}
              <div>
                <textarea
                  rows={4}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share what's on your mind with kindness..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-xs sm:text-sm text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
                />
              </div>

              {/* Image Preview / Upload */}
              {attachedImage && (
                <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                  <img src={attachedImage} alt="Upload preview" className="w-full h-auto object-cover" />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-700 text-xs font-bold text-slate-700 dark:text-emerald-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-emerald-950 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Attach Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={handleSubmitPost}
                  disabled={!newPostTitle.trim() && !newPostText.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#ff4500] hover:bg-[#e03d00] disabled:opacity-40 text-white font-extrabold text-xs tracking-wider uppercase shadow-md cursor-pointer transition-all"
                >
                  POST TO H/
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          CREATE SUBFORUM MODAL (§IV.5 Specification)
          ============================================================ */}
      <AnimatePresence>
        {isCreateSubforumOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#112017] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                    h/
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-emerald-50">
                      Create Your Own h/ Subforum
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Bayanihan Circle &bull; Peer-owned safe space
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateSubforumOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subforum Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block mb-1">
                  Subforum Name (auto-prefixed with h/)
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 px-3 py-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mr-1">h/</span>
                  <input
                    type="text"
                    value={newSubforumName}
                    onChange={(e) => setNewSubforumName(e.target.value.replace(/^h\//, ''))}
                    placeholder="e.g. gentlecampus, mindfulgamers, studycafe"
                    className="flex-1 bg-transparent text-xs font-bold text-slate-900 dark:text-emerald-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block mb-1">
                  Pick an Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['🌸', '🍃', '☀️', '🐾', '🧘', '☕', '🎨', '📚', '🌊', '🌿', '💡', '🛡️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSubforumIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                        newSubforumIcon === emoji
                          ? 'bg-emerald-500 text-white shadow-md scale-110'
                          : 'bg-slate-100 dark:bg-emerald-950 hover:bg-slate-200 text-slate-800 dark:text-emerald-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block mb-1">
                  Short Purpose / Description
                </label>
                <textarea
                  rows={2}
                  value={newSubforumDesc}
                  onChange={(e) => setNewSubforumDesc(e.target.value)}
                  placeholder="Tell peers what this safe space is for..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-300 dark:border-emerald-700 text-xs text-slate-900 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Owner Display */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <span>🛡️</span>
                <span>You will be listed as creator &amp; moderator: <strong>u/{userName.replace(/^u\//, '')}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSubforumOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubforumSubmit}
                  disabled={!newSubforumName.trim()}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                >
                  Create &amp; Launch Subforum (+5 WP)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
