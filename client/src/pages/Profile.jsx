import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Flame, MapPin, Send, Settings, UserPlus, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usersApi, postsApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { Avatar } from "../components/ui/Bits.jsx";
import { PageLoader } from "../components/ui/Loading.jsx";
import { resolveImage, getApiErrorMessage } from "../api/client.js";
import { timeAgo } from "../utils/format.js";
import { toast } from "../stores/toastStore.js";
import EmptyState from "../components/ui/EmptyState.jsx";
import EditProfileModal from "../components/profile/EditProfileModal.jsx";

export default function Profile() {
  const { t } = useTranslation(["profile", "common"]);
  const { username } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);
  const isOwner = currentUser?.username === username;

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile", username], queryFn: () => usersApi.getProfile(username) });
  const { data: posts } = useQuery({ queryKey: ["profile-posts", username], queryFn: () => usersApi.getUserPosts(username), enabled: tab === "posts" });
  const { data: collections } = useQuery({ queryKey: ["profile-collections", username], queryFn: () => usersApi.getUserCollections(username), enabled: tab === "collections" });

  if (isLoading) return <PageLoader />;
  if (!profile) return null;

  async function handleFollow() {
    if (!currentUser) return;
    try {
      if (profile.isFollowing) {
        await usersApi.unfollowUser(username);
      } else {
        await usersApi.followUser(username);
      }
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      await usersApi.uploadCover(formData);
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      toast(t("profile:toasts.coverUpdated"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!postText.trim()) return;
    setPosting(true);
    try {
      await postsApi.create({ text: postText.trim() });
      setPostText("");
      queryClient.invalidateQueries({ queryKey: ["profile-posts", username] });
      toast(t("profile:toasts.posted"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="h-48 sm:h-64 bg-ink-900 relative overflow-hidden border-b border-ink-800">
        {profile.coverUrl && <img src={resolveImage(profile.coverUrl)} alt="" className="h-full w-full object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
        {isOwner && (
          <label className="btn-ghost !bg-ink-950/60 absolute right-4 bottom-4 !py-2 !px-3 text-xs cursor-pointer backdrop-blur-sm">
            <Camera size={14} /> {coverUploading ? t("common:actions.uploading") : t("profile:cover.change")}
            <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={handleCoverChange} />
          </label>
        )}
      </div>

      <div className="container-page">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 pb-8">
          <Avatar src={profile.avatarUrl} name={profile.displayName} size={96} />
          <div className="flex-1">
            <h1 className="font-display text-2xl text-bone-50">{profile.displayName}</h1>
            <p className="text-sm text-bone-200/50">@{profile.username}</p>
          </div>
          {isOwner ? (
            <button onClick={() => setEditOpen(true)} className="btn-ghost">
              <Settings size={15} /> {t("common:nav.editProfile")}
            </button>
          ) : currentUser ? (
            <button onClick={handleFollow} className={profile.isFollowing ? "btn-ghost" : "btn-primary"}>
              {profile.isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
              {profile.isFollowing ? t("common:actions.unfollow") : t("common:actions.follow")}
            </button>
          ) : null}
        </div>

        {profile.bio && <p className="text-bone-200/70 max-w-xl mb-5">{profile.bio}</p>}

        <div className="flex flex-wrap gap-6 mb-8 text-sm">
          <Stat label={t("profile:stats.followers")} value={profile.followersCount} />
          <Stat label={t("profile:stats.following")} value={profile.followingCount} />
          <span className="flex items-center gap-1.5 text-bone-200/60">
            <Flame size={14} className="text-neon-pink" /> {t("profile:stats.dayStreak", { count: profile.streak?.count || 0 })}
          </span>
          <span className="text-bone-200/60">{t("common:levelXp", { level: profile.level, xp: profile.xp })}</span>
          {profile.homeCity && (
            <span className="flex items-center gap-1.5 text-bone-200/60">
              <MapPin size={14} /> {profile.homeCity.name}
            </span>
          )}
        </div>

        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {profile.interests.map((i) => (
              <span key={i} className="pill capitalize">{i}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-b border-ink-800 mb-6">
          {["posts", "collections"].map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px ${
                tab === tabKey ? "border-neon-cyan text-neon-cyan" : "border-transparent text-bone-200/50"
              }`}
            >
              {t(`profile:tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {tab === "posts" && (
            <div className="space-y-4 max-w-xl">
              {isOwner && (
                <form onSubmit={handlePost} className="card-surface p-4 flex gap-3">
                  <Avatar src={profile.avatarUrl} name={profile.displayName} size={38} />
                  <div className="flex-1">
                    <textarea
                      className="input-field resize-none"
                      rows={2}
                      placeholder={t("profile:posts.composerPlaceholder")}
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                      <button type="submit" disabled={posting} className="btn-primary !py-2 !px-4 text-sm">
                        <Send size={14} /> {t("common:actions.post")}
                      </button>
                    </div>
                  </div>
                </form>
              )}
              {posts?.map((post) => (
                <div key={post._id} className="card-surface p-5">
                  <p className="text-bone-200/90 mb-2">{post.text}</p>
                  {post.place && (
                    <Link to={`/places/${post.place.slug}`} className="pill inline-flex mb-2 hover:border-neon-cyan/50 hover:text-neon-cyan">
                      📍 {post.place.name}
                    </Link>
                  )}
                  <p className="text-xs text-bone-200/40">{timeAgo(post.createdAt)}</p>
                </div>
              ))}
              {posts && !posts.length && <EmptyState title={t("profile:posts.emptyTitle")} />}
            </div>
          )}

          {tab === "collections" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections?.map((c) => (
                <Link key={c._id} to={`/collections/${c._id}`} className="card-surface p-5 hover:border-neon-cyan/40 transition">
                  <h3 className="font-display text-lg text-bone-50 mb-1">{c.name}</h3>
                  <p className="text-sm text-bone-200/50 line-clamp-2 mb-2">{c.description}</p>
                  <p className="text-xs text-bone-200/40">{t("profile:collectionsTab.itemsCount", { count: c.items.length })}</p>
                </Link>
              ))}
              {collections && !collections.length && <EmptyState title={t("profile:collectionsTab.emptyTitle")} />}
            </div>
          )}
        </div>
      </div>

      {editOpen && <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span className="text-bone-200/60">
      <span className="text-bone-50 font-medium">{value}</span> {label}
    </span>
  );
}
