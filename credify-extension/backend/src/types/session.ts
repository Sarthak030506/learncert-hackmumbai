export interface WatchSegment {
  start: number;
  end: number;
}

export interface SeekEvent {
  timestamp: number;
  fromTime: number;
  toTime: number;
  direction: 'forward' | 'backward';
}

export interface SpeedChange {
  timestamp: number;
  fromSpeed: number;
  toSpeed: number;
}

export interface FocusEvent {
  timestamp: number;
  type: 'focus' | 'blur';
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  channelName: string;
  duration: number;
  url: string;
}

export interface WatchSession {
  id: string;
  userId: string;
  video: VideoMetadata;
  startedAt: number;
  endedAt: number | null;
  watchedSegments: WatchSegment[];
  totalWatchTime: number;
  seekEvents: SeekEvent[];
  speedChanges: SpeedChange[];
  focusEvents: FocusEvent[];
  pauseCount: number;
  averageSpeed: number;
  maxSpeed: number;
  tabActiveTime: number;
  tabInactiveTime: number;
  isCompleted: boolean;
}
