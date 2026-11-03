import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface EmbeddedSiteProps {
  uri: string;
}

export default function EmbeddedSite({ uri }: EmbeddedSiteProps) {
  return <WebView style={styles.webView} source={{ uri }} startInLoadingState />;
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
