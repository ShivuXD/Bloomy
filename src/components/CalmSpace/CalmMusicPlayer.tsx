import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNurture } from '../../contexts/NurtureContext';
import { Music, Play, Pause, Volume2, Volume1, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// YouTube Video ID for "Autism Calming Sensory: Relaxing Music"
const YOUTUBE_VIDEO_ID = 'DlnYANIVslc';
const STORAGE_MUSIC_ENABLED = 'nurture_calm_music_enabled';
const STORAGE_MUSIC_VOLUME = 'nurture_calm_music_vol';
const DEFAULT_VOLUME = 25; // Gentle background level (0 - 100)

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface CalmMusicPlayerProps {
  className?: string;
}

export const CalmMusicPlayer: React.FC<CalmMusicPlayerProps> = ({ className = '' }) => {
  const { accessibilitySettings, isPecoSpeaking } = useNurture();
  const { lowSensoryMode } = accessibilitySettings;

  // Music state: start as playing by default unless low-sensory mode is enabled
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !lowSensoryMode);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MUSIC_VOLUME);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        return isNaN(val) ? DEFAULT_VOLUME : Math.max(5, Math.min(60, val));
      }
    } catch {}
    return DEFAULT_VOLUME;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDucked, setIsDucked] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // References
  const playerRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  const wasPlayingBeforeDuckingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const isPecoSpeakingRef = useRef<boolean>(isPecoSpeaking);
  const lowSensoryModeRef = useRef<boolean>(lowSensoryMode);

  isPlayingRef.current = isPlaying;
  volumeRef.current = volume;
  isMutedRef.current = isMuted;
  isPecoSpeakingRef.current = isPecoSpeaking;
  lowSensoryModeRef.current = lowSensoryMode;

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const initPlayer = () => {
      if (!isMounted || playerRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      try {
        const container = document.getElementById(containerIdRef.current);
        if (!container) return;

        playerRef.current = new window.YT.Player(containerIdRef.current, {
          videoId: YOUTUBE_VIDEO_ID,
          width: '200',
          height: '120',
          playerVars: {
            autoplay: lowSensoryModeRef.current ? 0 : 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID, // Required by YouTube for looping a single video
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsPlayerReady(true);
              try {
                event.target.setVolume(volumeRef.current);
                if (isMutedRef.current) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }

                // If Peco is currently speaking, duck the background volume
                if (isPecoSpeakingRef.current) {
                  wasPlayingBeforeDuckingRef.current = true;
                  const ducked = Math.max(3, Math.round(volumeRef.current * 0.15));
                  event.target.setVolume(ducked);
                  setIsDucked(true);
                }

                // Automatically start playing background ambience unless low-sensory mode is enabled
                if (!lowSensoryModeRef.current) {
                  event.target.playVideo();
                  setIsPlaying(true);
                }
              } catch (e) {
                console.warn('Error setting initial YouTube volume / starting playback:', e);
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Calm Music error:', event.data);
              if (isMounted) {
                setHasError(true);
                setIsPlaying(false);
              }
            },
          },
        });
      } catch (err) {
        console.warn('Failed to instantiate YouTube player:', err);
        if (isMounted) setHasError(true);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Check if the script is already added
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      // Chain the ready callback
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        initPlayer();
      };

      // Fallback polling in case callback was missed
      pollInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          if (pollInterval) clearInterval(pollInterval);
          initPlayer();
        }
      }, 250);
    }

    // Cleanup: Strictly stop and destroy the player when leaving Calm Space
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (e) {
          console.warn('Error destroying YouTube player on exit:', e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Voice Ducking: Peco's Inworld voice must always remain clear and take priority
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isPecoSpeaking) {
        // Peco started speaking: duck or pause music temporarily
        if (isPlayingRef.current) {
          wasPlayingBeforeDuckingRef.current = true;
          if (volumeRef.current <= 15) {
            // If already whisper-quiet, pause temporarily so Peco is completely unobstructed
            playerRef.current.pauseVideo();
          } else {
            // Duck volume to ~4-5%
            const ducked = Math.max(3, Math.round(volumeRef.current * 0.15));
            playerRef.current.setVolume(ducked);
          }
          setIsDucked(true);
        }
      } else {
        // Peco finished speaking: restore music volume or resume
        if (wasPlayingBeforeDuckingRef.current) {
          wasPlayingBeforeDuckingRef.current = false;
          if (isPlayingRef.current) {
            playerRef.current.playVideo();
          }
          if (!isMutedRef.current) {
            playerRef.current.setVolume(volumeRef.current);
          }
          setIsDucked(false);
        }
      }
    } catch (e) {
      console.warn('Error during voice ducking:', e);
    }
  }, [isPecoSpeaking, isPlayerReady]);

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        try {
          localStorage.setItem(STORAGE_MUSIC_ENABLED, 'false');
        } catch {}
      } else {
        playerRef.current.setVolume(isMuted ? 0 : volume);
        playerRef.current.playVideo();
        setIsPlaying(true);
        try {
          localStorage.setItem(STORAGE_MUSIC_ENABLED, 'true');
        } catch {}
      }
    } catch (err) {
      console.warn('Error toggling play/pause:', err);
    }
  }, [isPlaying, isPlayerReady, isMuted, volume]);

  // Volume slider change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    try {
      localStorage.setItem(STORAGE_MUSIC_VOLUME, newVol.toString());
    } catch {}

    if (playerRef.current && isPlayerReady) {
      try {
        if (!isDucked && !isMuted) {
          playerRef.current.setVolume(newVol);
        }
        if (isMuted && newVol > 0) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } catch (err) {
        console.warn('Error changing volume:', err);
      }
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.warn('Error toggling mute:', err);
    }
  };

  return (
    <div
      id="calm-space-music-controller"
      className={`w-full max-w-md bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 sm:p-4 border border-indigo-100 shadow-xs transition-all ${className}`}
    >
      {/* Unobtrusive offscreen container for official YouTube Iframe Player */}
      <div
        className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none -left-[9999px]"
        aria-hidden="true"
      >
        <div id={containerIdRef.current} />
      </div>

      {/* Main Music Control Bar */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Title and sensory badge */}
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              isPlaying
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Music size={18} />
          </div>

          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
              Calming Music
            </span>
            {isPlaying && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          id="calm-music-toggle-btn"
          onClick={handleTogglePlay}
          disabled={!isPlayerReady && !hasError}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0 ${
            isPlaying
              ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } ${!isPlayerReady && !hasError ? 'opacity-70 cursor-wait' : ''}`}
          aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <>
              <Pause size={15} />
              <span>Pause Music</span>
            </>
          ) : (
            <>
              <Play size={15} className="fill-current" />
              <span>Play Music</span>
            </>
          )}
        </button>
      </div>

      {/* Volume Slider & Ducking Notice */}
      <div className="mt-3 pt-2.5 border-t border-indigo-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-[220px]">
          <button
            onClick={handleToggleMute}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={15} className="text-slate-400" />
            ) : volume < 30 ? (
              <Volume1 size={15} className="text-indigo-500" />
            ) : (
              <Volume2 size={15} className="text-indigo-600" />
            )}
          </button>

          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Calm music volume"
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />

          <span className="text-[10px] font-bold text-slate-500 w-7 text-right">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>

        {/* Sensory indicator or Peco speech ducking alert */}
        <div className="text-[10px] text-right min-w-0">
          <AnimatePresence mode="wait">
            {isDucked ? (
              <motion.span
                key="ducked"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200"
              >
                <Sparkles size={11} className="text-purple-600 shrink-0" />
                <span className="truncate">Quieted for Peco</span>
              </motion.span>
            ) : lowSensoryMode ? (
              <span className="text-slate-500 font-medium truncate">
                Low sensory active
              </span>
            ) : (
              <span className="text-slate-400 font-medium truncate">
                Gentle background
              </span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalmMusicPlayer;
