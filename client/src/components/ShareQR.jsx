import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ShareQR() {
  const [dataUrl, setDataUrl] = useState('');
  const homeUrl = window.location.origin + '/';

  useEffect(() => {
    QRCode.toDataURL(homeUrl, { width: 220, margin: 1 }).then(setDataUrl);
  }, [homeUrl]);

  return (
    <div className="share-qr">
      <h3>Mummy ke saath Share Karein</h3>
      <p className="hint-text">Unke phone se is QR code ko camera se scan karayein — seedha video list khul jaayegi.</p>
      {dataUrl && <img src={dataUrl} alt="QR code" className="qr-image" />}
      <p className="share-link">{homeUrl}</p>
    </div>
  );
}
