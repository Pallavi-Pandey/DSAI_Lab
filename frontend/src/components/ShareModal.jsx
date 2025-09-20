import React, { useState } from 'react';
import { X, Copy, Share2, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, shareData }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !shareData) return null;

  const { title, description, url, type } = shareData;

  const shareText = type === 'quiz' 
    ? `Check out this quiz: "${title}" - Test your knowledge!`
    : type === 'result'
    ? `I just scored ${description} on "${title}" quiz! 🎯 Can you beat my score?`
    : `Check out "${title}" on QuizMaster!`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Quiz</h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="share-preview">
            <h4>{title}</h4>
            <p>{description}</p>
          </div>

          <div className="share-options">
            <div className="share-buttons">
              <button 
                className="share-button twitter"
                onClick={() => handleShare('twitter')}
                title="Share on Twitter"
              >
                <Twitter size={20} />
                <span>Twitter</span>
              </button>

              <button 
                className="share-button facebook"
                onClick={() => handleShare('facebook')}
                title="Share on Facebook"
              >
                <Facebook size={20} />
                <span>Facebook</span>
              </button>

              <button 
                className="share-button whatsapp"
                onClick={() => handleShare('whatsapp')}
                title="Share on WhatsApp"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </button>

              <button 
                className="share-button email"
                onClick={() => handleShare('email')}
                title="Share via Email"
              >
                <Mail size={20} />
                <span>Email</span>
              </button>
            </div>

            {navigator.share && (
              <button 
                className="share-button native"
                onClick={nativeShare}
                title="More sharing options"
              >
                <Share2 size={20} />
                <span>More Options</span>
              </button>
            )}
          </div>

          <div className="share-link">
            <label>Share Link:</label>
            <div className="link-container">
              <input 
                type="text" 
                value={url} 
                readOnly 
                className="link-input"
              />
              <button 
                onClick={copyToClipboard}
                className={`copy-button ${copied ? 'copied' : ''}`}
                title="Copy link"
              >
                {copied ? 'Copied!' : <><Copy size={16} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
