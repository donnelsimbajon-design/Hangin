import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
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
  Heart,
  Award,
  Flame,
  Clock,
  TrendingUp,
  Bookmark,
  Plus,
  Tag,
  Hash,
  Calendar,
  Globe,
  Flower2,
  Leaf,
  HeartHandshake,
  PawPrint,
  type LucideIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ForumPost,
  ForumComment,
  ForumAward,
  PetSpecies,
  EquippedAccessories,
  Subforum,
} from '../types';
import { CIRCLE_AWARD_VISUALS } from '../data/circleAwards';
import { CuteCompanion } from './CuteCompanion';

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
  onTriggerCrisisSafety: () => void;
}

/**
 * The awards a user can hand to a post. `name` and `icon` are what gets
 * persisted through `onGiveAward` and are unchanged. `tier` only picks the
 * shared Circle Award visual (Lucide icon + colours) that the picker shows, so
 * this page matches the award categories in ExpandedMarket.
 */
const AVAILABLE_AWARDS = [
  { id: 'wholesome', icon: '🏆', name: 'Wholesome', tier: 3 },
  { id: 'hugz', icon: '🫂', name: 'Warm Hug', tier: 2 },
  { id: 'fresh', icon: '🌱', name: 'Fresh Air', tier: 1 },
  { id: 'mindful', icon: '✨', name: 'Mindful Spark', tier: 4 },
  { id: 'shield', icon: '🛡️', name: 'Shielded', tier: 5 },
];

/**
 * Posts keep their flair inline in the title ("[🌿 Wholesome] Real Title") and
 * their circle in `channel`. Both are lifted out here for the card's tag row and
 * the title is handed back clean. Display only — the stored post is untouched,
 * and no new field is added to the ForumPost model.
 */
const splitPostTags = (post: ForumPost) => {
  const raw = post.title || '';
  const tags: string[] = [];

  let rest = raw;
  const leading = /^\s*\[([^\]]+)\]\s*/;
  let match = leading.exec(rest);
  while (match) {
    const tag = match[1].trim();
    if (tag) tags.push(tag);
    rest = rest.slice(match[0].length);
    match = leading.exec(rest);
  }

  const circle = post.channel.replace(/^h\//, '').trim();
  if (circle) tags.push(circle);

  return { title: rest || raw, tags };
};

/**
 * `ForumPost.timestamp` is `string | number` and in practice holds a human
 * label ("2 hours ago", "Just now"), so `new Date(...)` can be an Invalid Date.
 * `toISOString()` on an Invalid Date throws `RangeError: Invalid time value`
 * during render, which unmounts the whole tree and blanks the page. So the
 * date is resolved defensively: a real Date when the value parses, otherwise
 * `null` and the raw label is rendered as-is.
 */
const getPostDate = (post: ForumPost) => {
  const date = new Date(post.timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * A post/comment author's companion, drawn as a small round avatar.
 *
 * This renders the SAME `CuteCompanion` mascot the rest of the sanctuary uses,
 * at the `avatar` size, wearing the `EquippedAccessories` recorded on the post
 * or comment. So the avatar is literally the author's companion rather than a
 * separate icon set, and it stays in step with the wardrobe renderer: a hat
 * bought in the Market shows up here too.
 *
 * `species` is read with `authorSpecies` as a fallback because both spellings
 * exist on stored posts, and it falls back to the viewer only in the (practically
 * unreachable) case of a post with no species at all.
 */
const CompanionAvatar: React.FC<{
  post: {
    species?: PetSpecies;
    authorSpecies?: PetSpecies;
    equipped?: EquippedAccessories;
  };
  label: string;
  size?: 'sm' | 'md';
}> = ({ post, label, size = 'md' }) => {
  const species =
    post.species ?? post.authorSpecies ?? 'dog';

  /*
   * The companion art is a full seated figure, so a straight `w-full h-full`
   * fit would show head-to-paws and read as a squashed pet rather than a face.
   * Scaling it up and anchoring the transform to the top crops in on the head
   * and shoulders, which is what makes a 28-36px circle legible.
   */
  const box = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const zoom =
    size === 'sm'
      ? 'scale-[1.7] origin-top'
      : 'scale-[1.5] origin-top';

  return (
    <span
      title={`${label}'s companion`}
      className={`${box} shrink-0 rounded-full overflow-hidden bg-emerald-50 dark:bg-[#0e1a15] border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-center`}
    >
      <span className={`block w-full h-full ${zoom}`}>
        <CuteCompanion
          species={species}
          equipped={post.equipped}
          size="avatar"
          interactive={false}
          mood="idle"
        />
      </span>
    </span>
  );
};

/**
 * Interface icons for the built-in circles, so no emoji is used as chrome.
 * Custom subforums keep the emoji their owner picked, since that is stored on
 * the Subforum itself (see `newSubforumIcon`) and rendered as-is.
 */
const CHANNEL_ICONS: Record<string, LucideIcon> = {
  all: Globe,
  'h/gentleminds': Flower2,
  'h/smallwins': Sparkles,
  'h/digitaldetox': Leaf,
  'h/venting': HeartHandshake,
  'h/furryfriends': PawPrint,
};

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
  const CurrentSubforumIcon = currentSubforum ? CHANNEL_ICONS[currentSubforum.id] : undefined;

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
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    showToast(`Created ${formattedId}! 🎉`);
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
    showToast('Link copied to clipboard! 🌿');
  };

  const handleVote = (postId: string, direction: 'up' | 'down') => {
    onVotePost(postId, direction);
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

    setNewPostTitle('');
    setNewPostText('');
    setAttachedImage(null);
    setIsCreatePostOpen(false);
    showToast('Posted to ' + selectedChannelForPost + '! 🍃');
  };

  const handleAddCommentSubmit = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
    showToast('Comment added! 💬');
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
          SEARCH + CREATE (replaces the old "h/ Safe Haven" banner)
          ============================================================ */}
      <div className="rounded-2xl bg-white dark:bg-[#13221b] border border-emerald-200 dark:border-emerald-800/80 shadow-xs p-2 flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-[#0e1a15] border border-emerald-200 dark:border-emerald-800/70 text-xs text-slate-800 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsCreatePostOpen((v) => !v)}
          aria-expanded={isCreatePostOpen}
          aria-label="Create a post"
          title="Create a post"
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isCreatePostOpen
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Plus
            className={`w-5 h-5 transition-transform duration-200 ${
              isCreatePostOpen ? 'rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* ============================================================
          CREATE POST MODAL — opened by the Plus button. Same controls as
          before; only the container changed. Click the backdrop or X to close.
          ============================================================ */}
      <AnimatePresence>
        {isCreatePostOpen && (
          <motion.div
            key="create-post-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreatePostOpen(false)}
            className="fixed inset-0 z-50 bg-[#0b1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Create a post"
              className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#13221b] rounded-3xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/60 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    h/
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-emerald-100 truncate">
                    Create a post in Hangin
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(false)}
                  aria-label="Close composer"
                  className="p-1 rounded-full text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-700 dark:hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-hangin Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-emerald-300 block mb-1">
                  Choose a Circle
                </label>
                <select
                  value={selectedChannelForPost}
                  onChange={(e) => setSelectedChannelForPost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-[#2d4d41] text-xs font-bold text-slate-800 dark:text-emerald-100 focus:outline-none"
                >
                  <option value="h/gentleminds">h/gentleminds - Calm thoughts</option>
                  <option value="h/smallwins">h/smallwins - Habit victories</option>
                  <option value="h/digitaldetox">h/digitaldetox - Screen limits</option>
                  <option value="h/venting">h/venting - Safe venting</option>
                  <option value="h/furryfriends">h/furryfriends - Companion tales</option>
                </select>
              </div>

              {/* Flair selector — existing fixed emoji controls, kept */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-emerald-300 block mb-1">
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
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="An interesting title..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-[#2d4d41] text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Text Body */}
              <textarea
                rows={3}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share what's on your mind with kindness..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-[#2d4d41] text-xs sm:text-sm text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Image Preview / Upload */}
              {attachedImage && (
                <div className="relative rounded-xl overflow-hidden max-h-48 border border-emerald-200">
                  <img
                    src={attachedImage}
                    alt="Upload preview"
                    className="w-full h-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0b1411]/70 text-white hover:bg-black cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-[#2d4d41] text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
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
                  type="button"
                  onClick={handleSubmitPost}
                  disabled={!newPostTitle.trim() && !newPostText.trim()}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs tracking-wider uppercase shadow-md cursor-pointer transition-all"
                >
                  POST TO H/
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          CATEGORIES — sits below the search bar
          ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-emerald-400">
            Categories
          </span>
        </div>

        {/* Sub-hangin Pills + Create Subforum Button */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
          {allChannels.map((ch) => {
            const isActive = activeChannel === ch.id;
            const ChannelIcon = CHANNEL_ICONS[ch.id];
            return (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#13221b] text-slate-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                }`}
              >
                {ChannelIcon ? (
                  <ChannelIcon className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <span>{ch.icon}</span>
                )}
                <span>{ch.name}</span>
              </button>
            );
          })}

          {/* + Create Subforum Button (§IV.5 Specification) */}
          <button
            onClick={() => setIsCreateSubforumOpen(true)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-[#2d4d41]/75 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
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
              {CurrentSubforumIcon ? (
                <CurrentSubforumIcon className="w-7 h-7 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="text-2xl shrink-0">{currentSubforum.icon}</span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-50 truncate">
                    {currentSubforum.name}
                  </h4>
                  {currentSubforum.owner && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-[#2d4d41]/40 shrink-0">
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
      <div className="flex items-center gap-2 px-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
        <button
          onClick={() => setSortFilter('hot')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'hot'
              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
              : 'hover:text-emerald-900 dark:hover:text-emerald-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSortFilter('new')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'new'
              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
              : 'hover:text-emerald-900 dark:hover:text-emerald-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSortFilter('top')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            sortFilter === 'top'
              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
              : 'hover:text-emerald-900 dark:hover:text-emerald-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Top</span>
        </button>
      </div>

      {/* ============================================================
          COMMUNITY FEED — each card is header (username + companion avatar +
          date), body (title, content, tags, extras), then the action footer
          ============================================================ */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const upvotes = post.votes?.up ?? (post.score > 0 ? post.score : 0);
          const isLiked = post.userVote === 'up';
          const commentCount = post.comments?.length || 0;
          const { title: displayTitle, tags } = splitPostTags(post);
          const postDate = getPostDate(post);

          return (
            <div
              key={post.id}
              className="rounded-2xl bg-white dark:bg-[#13221b] border border-emerald-200 dark:border-emerald-800/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col overflow-hidden"
            >
              {/* 1. HEADER — the author's companion avatar, then their username,
                  with the date pushed to the far right. The avatar is the first
                  flex child and `shrink-0`, so the username is what truncates
                  on a narrow screen rather than the avatar being squeezed. */}
              <div className="flex items-center gap-2 px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <CompanionAvatar
                  post={post}
                  label={post.authorName || post.author || 'GentleUser'}
                />

                <span className="text-xs sm:text-[13px] font-bold text-slate-700 dark:text-emerald-200 min-w-0 truncate">
                  u/{post.authorName || post.author || 'GentleUser'}
                </span>

                <time
                  dateTime={postDate?.toISOString()}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-emerald-400/70 shrink-0 whitespace-nowrap"
                >
                  <Calendar className="w-3 h-3 shrink-0" />
                  {postDate ? postDate.toLocaleDateString() : String(post.timestamp ?? '')}
                </time>
              </div>

              {/* 2. BODY — title, then the post content itself */}
              <div className="px-3 sm:px-4">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-emerald-50 leading-snug">
                  {displayTitle}
                </h3>

                <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-emerald-200/90 leading-relaxed whitespace-pre-wrap">
                  {post.content || post.text}
                </p>

                {/* 3. Tags — flair + circle, lifted from existing post data.
                    The author no longer appears here: they are the header. */}
                {tags.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/70 text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300"
                      >
                        <Hash className="w-3 h-3 shrink-0 opacity-70" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 4. Existing subform / content area */}
                {/* Attached Media */}
                {post.mediaUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden max-h-80 border border-emerald-200 dark:border-emerald-800">
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

                {/* Interactive Comments Drawer */}
                {activeCommentPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-800 space-y-3">
                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a kind, mindful reply..."
                        className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-[#2d4d41] text-xs text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleAddCommentSubmit(post.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer transition-colors"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((cmt) => {
                          const commentAuthor =
                            cmt.authorName || cmt.author || 'MindfulFriend';

                          return (
                            /* Same avatar-then-username header as a post, at
                               the smaller avatar size a nested reply can
                               afford, with the body beneath it. */
                            <div
                              key={cmt.id}
                              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-xs"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-emerald-200 text-[11px] mb-1.5">
                                <CompanionAvatar
                                  post={cmt}
                                  label={commentAuthor}
                                  size="sm"
                                />

                                <span className="min-w-0 truncate">{`u/${commentAuthor}`}</span>

                                <span className="text-slate-400 shrink-0">•</span>
                                <span className="text-slate-400 font-normal shrink-0 whitespace-nowrap">
                                  {new Date(cmt.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-emerald-300/90">{cmt.text}</p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-emerald-400 italic py-2 text-center">
                          No comments yet. Be the first to share warmth!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Footer actions — Like / Comments / Award / Share. These
                    award nothing: taking part in the circle is the reward. */}
                <div className="mt-3 pt-2.5 pb-3 sm:pb-4 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center flex-wrap gap-x-1 sm:gap-x-2 gap-y-1 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-emerald-400">
                  {/* Heart — Like */}
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    aria-pressed={isLiked}
                    title={isLiked ? 'Remove your like' : 'Like this post'}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLiked
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/60'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                    {upvotes > 0 && (
                      <span className="text-[10px] font-black opacity-70">{upvotes}</span>
                    )}
                  </button>

                  {/* MessageCircle — Comments */}
                  <button
                    onClick={() =>
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                    }
                    aria-expanded={activeCommentPostId === post.id}
                    title="Open comments"
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                    {commentCount > 0 && (
                      <span className="text-[10px] font-black opacity-70">{commentCount}</span>
                    )}
                  </button>

                  {/* Award — circular trigger + anchored category popover */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setAwardPickerPostId(awardPickerPostId === post.id ? null : post.id)
                      }
                      aria-expanded={awardPickerPostId === post.id}
                      aria-haspopup="true"
                      title="Give this post an award"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 ${
                          awardPickerPostId === post.id
                            ? 'text-amber-600 dark:text-amber-300'
                            : 'text-amber-500 dark:text-amber-400'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                      </span>
                      <span>Award</span>
                    </button>

                    {/* Award categories — circular icons only, no text labels.
                        Anchored to the Award button and opened upward, so it
                        floats over the post instead of pushing content down. */}
                    <AnimatePresence>
                      {awardPickerPostId === post.id && (
                        <motion.div
                          key={`award-picker-${post.id}`}
                          initial={{ opacity: 0, y: 6, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.94 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 flex items-center gap-1 rounded-full bg-white dark:bg-[#13221b] border border-amber-200 dark:border-amber-800/70 shadow-lg p-1.5 max-w-[calc(100vw-1.5rem)]"
                        >
                          {AVAILABLE_AWARDS.map((aw) => {
                            const visual =
                              CIRCLE_AWARD_VISUALS.find((c) => c.tier === aw.tier) ??
                              CIRCLE_AWARD_VISUALS[0];
                            const CategoryIcon = visual.Icon;
                            return (
                              <button
                                key={aw.id}
                                onClick={() => {
                                  onGiveAward(post.id, aw.name, aw.icon);
                                  setAwardPickerPostId(null);
                                  showToast(`Gave ${aw.name} award! 🏆`);
                                }}
                                title={aw.name}
                                aria-label={`Give ${aw.name} award`}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${visual.iconBg} ${visual.iconColor}`}
                              >
                                <CategoryIcon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Share2 — Share */}
                  <button
                    onClick={() => handleSharePost(post)}
                    title="Share post & copy link"
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          CREATE SUBFORUM MODAL (§IV.5 Specification)
          ============================================================ */}
      <AnimatePresence>
        {isCreateSubforumOpen && (
          <div className="fixed inset-0 z-50 bg-[#0b1411]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#13221b] rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center text-sm font-black shadow-xs">
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
                  className="p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subforum Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block mb-1">
                  Subforum Name (auto-prefixed with h/)
                </label>
                <div className="flex items-center rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-[#2d4d41] px-3 py-2">
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
                          : 'bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
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
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-[#2d4d41] text-xs text-slate-900 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Owner Display */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>You will be listed as creator &amp; moderator: <strong>u/{userName.replace(/^u\//, '')}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSubforumOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubforumSubmit}
                  disabled={!newSubforumName.trim()}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
                >
                  Create &amp; Launch Subforum
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};