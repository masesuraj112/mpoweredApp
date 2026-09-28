interface EmbeddedSiteProps {
  uri: string;
}

// react-native-webview has no web support, so fall back to an iframe
export default function EmbeddedSite({ uri }: EmbeddedSiteProps) {
  return <iframe src={uri} title="Embedded site" style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} />;
}
