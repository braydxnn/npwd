import React from 'react';
import { isDefaultWallpaper } from './apps/settings/utils/isDefaultWallpaper';
import { useSettings } from './apps/settings/hooks/useSettings';
import { usePhoneVisibility } from './os/phone/hooks/usePhoneVisibility';
import { Slide } from '@mui/material';
import { useCheckPlayerReady } from './os/phone/hooks/useCheckPlayerReady';
import { usePhoneService } from './os/phone/hooks/usePhoneService';

const PhoneWrapper: React.FC = ({ children }) => {
  const { isPlayerReady } = useCheckPlayerReady();
  const [settings] = useSettings();

  const { bottom, visibility } = usePhoneVisibility();

  usePhoneService();

  if (!isPlayerReady) return null;

  return (
    <Slide direction="up" timeout={{ enter: 500, exit: 500 }} in={visibility}>
      <div className="PhoneWrapper">
        <div
          className="Phone"
          style={{
            position: 'fixed',
            transformOrigin: 'right bottom',
            transform: `scale(${settings.zoom.value}`,
            bottom,
          }}
        >
          <div
            className="PhoneFrame"
            style={{
              backgroundImage: `url(media/frames/${settings.frame.value})`,
            }}
          />
          <div
            id="phone"
            className="PhoneScreen"
            style={{
              backgroundImage: !isDefaultWallpaper(settings.wallpaper.value)
                ? `url(${settings.wallpaper.value})`
                : `url(media/backgrounds/${settings.wallpaper.value})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </Slide>
  );
};

export default PhoneWrapper;
