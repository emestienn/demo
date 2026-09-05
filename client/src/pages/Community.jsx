import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Send } from "lucide-react";
import { postsApi, likesApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { Avatar } from "../components/ui/Bits.jsx";
import { PageLoader } from "../components/ui/Loading.jsx";
import { resolveImage, getApiErrorMessage } from "../api/client.js";
import { timeAgo } from "../utils/format.js";
import { toast } from "../stores/toastStore.js";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function Community() {
  const { t } = useTranslation(["community", "common"]);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [tab, setTab] = useState("all");
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["feed", tab],
    queryFn: () => postsApi.listFeed(tab === "following" ? { following: "true" } : {}),
  });

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await postsApi.create({ text: text.trim() });
      setText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast(t("community:postedToast"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(post) {
    if (!user) return navigate("/login");
    await likesApi.toggle("Post", post._id);
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("community:eyebrow")}</p>
      <h1 className="font-display text-4xl text-bone-50 mb-8">{t("community:heading")}</h1>

      {user && (
        <form onSubmit={handlePost} className="card-surface p-4 mb-6 flex gap-3">
          <Avatar src={user.avatarUrl} name={user.displayName} size={38} />
          <div className="flex-1">
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder={t("community:composePlaceholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={posting} className="btn-primary !py-2 !px-4 text-sm">
                <Send size={14} /> {t("common:actions.post")}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("all")} className={`pill ${tab === "all" ? "border-neon-cyan text-neon-cyan" : ""}`}>{t("community:tabs.all")}</button>
        {user && (
          <button onClick={() => setTab("following")} className={`pill ${tab === "following" ? "border-neon-cyan text-neon-cyan" : ""}`}>
            {t("community:tabs.following")}
          </button>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-4">
          {data?.data?.map((post) => (
            <div key={post._id} className="card-surface p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={post.author?.avatarUrl} name={post.author?.displayName} size={36} />
                <div>
                  <Link to={`/u/${post.author?.username}`} className="text-sm font-medium text-bone-100 hover:text-neon-cyan">
                    {post.author?.displayName}
                  </Link>
                  <p className="text-xs text-bone-200/40">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              <p className="text-bone-200/90 mb-3">{post.text}</p>
              {post.images?.[0] && (
                <img src={resolveImage(post.images[0])} alt="" className="rounded-xl mb-3 max-h-96 w-full object-cover" />
              )}
              {post.place && (
                <Link to={`/places/${post.place.slug}`} className="pill mb-3 inline-flex hover:border-neon-cyan/50 hover:text-neon-cyan">
                  📍 {post.place.name}
                </Link>
              )}
              <div className="flex items-center gap-5 pt-2 border-t border-ink-800">
                <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 text-sm text-bone-200/60 hover:text-neon-pink">
                  <Heart size={16} className={post.likedByMe ? "fill-neon-pink text-neon-pink" : ""} /> {post.likeCount}
                </button>
                <button
                  onClick={() => setOpenComments(openComments === post._id ? null : post._id)}
                  className="flex items-center gap-1.5 text-sm text-bone-200/60 hover:text-neon-cyan"
                >
                  <MessageCircle size={16} /> {post.commentCount}
                </button>
              </div>
              {openComments === post._id && <CommentsThread postId={post._id} />}
            </div>
          ))}
          {!data?.data?.length && (
            <EmptyState title={t("community:empty.title")} description={t("community:empty.description")} />
          )}
        </div>
      )}
    </div>
  );
}

function CommentsThread({ postId }) {
  const { t } = useTranslation("community");
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const { data: comments } = useQuery({ queryKey: ["comments", postId], queryFn: () => postsApi.listComments(postId) });

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await postsApi.createComment(postId, text.trim());
    setText("");
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  return (
    <div className="mt-4 pt-4 border-t border-ink-800 space-y-3">
      {comments?.map((c) => (
        <div key={c._id} className="flex gap-2.5">
          <Avatar src={c.author?.avatarUrl} name={c.author?.displayName} size={26} />
          <div>
            <p className="text-xs font-medium text-bone-100">{c.author?.displayName}</p>
            <p className="text-sm text-bone-200/70">{c.text}</p>
          </div>
        </div>
      ))}
      {user && (
        <form onSubmit={submit} className="flex gap-2">
          <input className="input-field !py-2 text-sm" placeholder={t("commentPlaceholder")} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn-ghost !px-3 !py-2">
            <Send size={13} />
          </button>
        </form>
      )}
    </div>
  );
}
