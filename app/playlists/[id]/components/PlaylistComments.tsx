"use client";

import Image from "next/image";
import { useState } from "react";

interface Comment {
  id: number;
  name: string;
  time: string;
  text: string;
  likes: number;
}

export const PlaylistComments: React.FC = () => {
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  
  const comments: Comment[] = [
    {id:1, name:'Sarah Chen', time:'2 hours ago', text:'This playlist is absolutely fire! The transition between tracks is seamless.', likes:24},
    {id:2, name:'Marcus Brown', time:'5 hours ago', text:'Needs more songs. Otherwise solid playlist.', likes:12},
    {id:3, name:'Jamal Williams', time:'1 day ago', text:'Discovered so many new artists from this playlist.', likes:42},
    {id:4, name:'Elena Rodriguez', time:'2 days ago', text:'The sequencing is perfect! Love how each track flows into the next.', likes:31}
  ];

  const toggleCommentLike = (id: number) => setCommentLikes(prev => ({...prev, [id]: !prev[id]}));

  return (
    <div className="comments-section mt-10">
      <div className="comments-header flex items-center justify-between mb-5">
        <h3 className="comments-title text-xl font-semibold">Comments</h3>
        <select className="comments-filter bg-[#222] border-0 rounded px-3 py-1 text-sm text-white">
          <option>Newest first</option>
          <option>Most liked</option>
        </select>
      </div>

      {comments.map(comment => (
        <div key={comment.id} className="comment flex gap-3 mb-6">
          <Image
            src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg"
            alt="User"
            width={60}
            height={60}
            className="comment-avatar rounded-full object-cover shrink-0"
          />
          <div className="comment-content flex-1">
            <div className="comment-header flex items-center gap-2 mb-1">
              <span className="commenter-name font-semibold">{comment.name}</span>
              <span className="comment-time text-xs text-gray-400">{comment.time}</span>
            </div>
            <p className="comment-text text-sm mb-2">{comment.text}</p>
            <div className="comment-actions flex gap-4 text-sm text-gray-400">
              <button
                className={`comment-action flex items-center gap-1 transition-colors hover:text-white ${
                  commentLikes[comment.id] ? 'text-[#6a11cb]' : ''
                }`}
                onClick={() => toggleCommentLike(comment.id)}
              >
                <i className={`${commentLikes[comment.id] ? 'fas' : 'far'} fa-heart`} />
                <span>{comment.likes + (commentLikes[comment.id] ? 1 : 0)}</span>
              </button>
              <button className="comment-action flex items-center gap-1 transition-colors hover:text-white">
                <i className="far fa-comment" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};