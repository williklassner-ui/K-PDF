import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/colors';

const PDF_VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=4,user-scalable=yes">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow-x:hidden;background:#525659}
#toolbar{display:none}
#viewer{display:flex;flex-direction:column;align-items:center;padding:8px 0;min-height:100vh}
.page-wrapper{margin:6px 0;position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.4)}
canvas{display:block;max-width:100%}
.page-num{position:absolute;bottom:4px;right:6px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;padding:2px 6px;border-radius:4px;pointer-events:none}
#loading{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:sans-serif;font-size:16px;text-align:center}
.dark-filter{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;background:rgba(0,0,0,0);mix-blend-mode:multiply;z-index:1000;display:none}
</style>
</head>
<body>
<div id="loading">Lade PDF...</div>
<div class="dark-filter" id="darkFilter"></div>
<div id="viewer"></div>
<script type="module">
const cdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const script = document.createElement('script');
script.src = cdnBase + 'pdf.min.js';
script.onload = () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = cdnBase + 'pdf.worker.min.js';
  init();
};
document.head.appendChild(script);

let pdfDoc = null;
let currentPage = 1;
let isDark = false;
let searchMatches = [];
let renderTasks = {};

function init() {
  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
  postToApp({type:'ready'});
}

function handleMessage(e) {
  let msg;
  try { msg = JSON.parse(e.data); } catch { return; }
  if (msg.type === 'load') loadPDF(msg.base64);
  else if (msg.type === 'goTo') scrollToPage(msg.page);
  else if (msg.type === 'zoom') setZoom(msg.scale);
  else if (msg.type === 'dark') setDark(msg.enabled);
  else if (msg.type === 'search') performSearch(msg.query);
  else if (msg.type === 'clearSearch') clearSearch();
  else if (msg.type === 'nextSearch') navigateSearch(1);
  else if (msg.type === 'prevSearch') navigateSearch(-1);
}

function postToApp(data) {
  try { window.ReactNativeWebView.postMessage(JSON.stringify(data)); } catch {}
}

async function loadPDF(base64) {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('viewer').innerHTML = '';
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    pdfDoc = await pdfjsLib.getDocument({data:bytes,cMapUrl:cdnBase+'cmaps/',cMapPacked:true}).promise;
    document.getElementById('loading').style.display = 'none';
    postToApp({type:'loaded', numPages: pdfDoc.numPages});
    for (let i = 1; i <= pdfDoc.numPages; i++) await renderPage(i);
  } catch(err) {
    document.getElementById('loading').textContent = 'Fehler: ' + err.message;
    postToApp({type:'error', message: err.message});
  }
}

async function renderPage(num) {
  const page = await pdfDoc.getPage(num);
  const vw = window.innerWidth - 16;
  const viewport = page.getViewport({scale: vw / page.getViewport({scale:1}).width});
  const wrapper = document.createElement('div');
  wrapper.className = 'page-wrapper';
  wrapper.id = 'page-' + num;
  wrapper.dataset.page = num;
  const canvas = document.createElement('canvas');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  const numLabel = document.createElement('div');
  numLabel.className = 'page-num';
  numLabel.textContent = num;
  wrapper.appendChild(canvas);
  wrapper.appendChild(numLabel);
  document.getElementById('viewer').appendChild(wrapper);
  const ctx = canvas.getContext('2d');
  const task = page.render({canvasContext:ctx, viewport});
  renderTasks[num] = task;
  await task.promise;
  delete renderTasks[num];
}

function scrollToPage(num) {
  const el = document.getElementById('page-' + num);
  if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  currentPage = num;
}

function setZoom(scale) {
  document.body.style.zoom = scale;
}

function setDark(enabled) {
  isDark = enabled;
  document.getElementById('darkFilter').style.display = enabled ? 'block' : 'none';
  document.body.style.background = enabled ? '#1a1a1a' : '#525659';
  if (enabled) {
    document.getElementById('darkFilter').style.background = 'rgba(0,0,0,0.45)';
  }
}

async function performSearch(query) {
  clearSearch();
  if (!pdfDoc || !query) return;
  const results = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(it => it.str).join(' ');
    if (text.toLowerCase().includes(query.toLowerCase())) {
      results.push({page: i, text});
    }
  }
  searchMatches = results;
  postToApp({type:'searchResults', count: results.length, pages: results.map(r=>r.page)});
  if (results.length > 0) scrollToPage(results[0].page);
}

let searchIdx = 0;
function navigateSearch(dir) {
  if (!searchMatches.length) return;
  searchIdx = (searchIdx + dir + searchMatches.length) % searchMatches.length;
  scrollToPage(searchMatches[searchIdx].page);
  postToApp({type:'searchIndex', index: searchIdx});
}

function clearSearch() {
  searchMatches = [];
  searchIdx = 0;
}

// Track visible page for page number updates
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio > 0.4) {
      const p = parseInt(e.target.dataset.page);
      if (p !== currentPage) {
        currentPage = p;
        postToApp({type:'pageChanged', page: p});
      }
    }
  });
}, {threshold:0.4});

const origAppend = document.getElementById('viewer').appendChild.bind(document.getElementById('viewer'));
const viewerEl = document.getElementById('viewer');
const MO = new MutationObserver(muts => {
  muts.forEach(m => {
    m.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.dataset && n.dataset.page) observer.observe(n);
    });
  });
});
MO.observe(viewerEl, {childList:true});
</script>
</body>
</html>`;

export interface PDFViewerRef {
  goToPage: (page: number) => void;
  setZoom: (scale: number) => void;
  setDark: (enabled: boolean) => void;
  search: (query: string) => void;
  clearSearch: () => void;
  nextSearch: () => void;
  prevSearch: () => void;
  reload: () => void;
}

interface PDFViewerProps {
  base64?: string;
  filePath?: string;
  onLoaded?: (numPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (message: string) => void;
  onSearchResults?: (count: number, pages: number[]) => void;
  onSearchIndex?: (index: number) => void;
  darkMode?: boolean;
  style?: object;
}

const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(
  (
    {
      base64,
      onLoaded,
      onPageChanged,
      onError,
      onSearchResults,
      onSearchIndex,
      darkMode = false,
      style,
    },
    ref
  ) => {
    const webviewRef = useRef<WebView>(null);

    const send = useCallback((msg: object) => {
      webviewRef.current?.injectJavaScript(
        `(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(msg))}}))})();true;`
      );
    }, []);

    useImperativeHandle(ref, () => ({
      goToPage: (page) => send({ type: 'goTo', page }),
      setZoom: (scale) => send({ type: 'zoom', scale }),
      setDark: (enabled) => send({ type: 'dark', enabled }),
      search: (query) => send({ type: 'search', query }),
      clearSearch: () => send({ type: 'clearSearch' }),
      nextSearch: () => send({ type: 'nextSearch' }),
      prevSearch: () => send({ type: 'prevSearch' }),
      reload: () => {
        if (base64) send({ type: 'load', base64 });
      },
    }));

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === 'ready' && base64) {
            send({ type: 'load', base64 });
            if (darkMode) send({ type: 'dark', enabled: true });
          } else if (msg.type === 'loaded') {
            onLoaded?.(msg.numPages);
          } else if (msg.type === 'pageChanged') {
            onPageChanged?.(msg.page);
          } else if (msg.type === 'error') {
            onError?.(msg.message);
          } else if (msg.type === 'searchResults') {
            onSearchResults?.(msg.count, msg.pages);
          } else if (msg.type === 'searchIndex') {
            onSearchIndex?.(msg.index);
          }
        } catch {
          /* ignore */
        }
      },
      [base64, darkMode, send, onLoaded, onPageChanged, onError, onSearchResults, onSearchIndex]
    );

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webviewRef}
          source={{ html: PDF_VIEWER_HTML }}
          onMessage={handleMessage}
          javaScriptEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          domStorageEnabled
          style={styles.webview}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          renderLoading={() => <View />}
          startInLoadingState={false}
        />
      </View>
    );
  }
);

PDFViewer.displayName = 'PDFViewer';
export default PDFViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pdfBg,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
